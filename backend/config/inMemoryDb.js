import { randomUUID } from "crypto";

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = new Map();
    this.indexes = [];
  }

  _genId() {
    return randomUUID().replace(/-/g, "").slice(0, 24);
  }

  _match(doc, query) {
    for (const [key, val] of Object.entries(query)) {
      if (key === "$or") {
        if (!val.some((sub) => this._match(doc, sub))) return false;
        continue;
      }
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        if ("$in" in val && !val.$in.includes(doc[key])) return false;
        if ("$ne" in val && val.$ne === doc[key]) return false;
        if ("$gt" in val && !(doc[key] > val.$gt)) return false;
        if ("$gte" in val && !(doc[key] >= val.$gte)) return false;
        if ("$lt" in val && !(doc[key] < val.$lt)) return false;
        if ("$lte" in val && !(doc[key] <= val.$lte)) return false;
        if (val instanceof Date || typeof val === "number") {
          if (doc[key] !== val) return false;
        }
        continue;
      }
      if (doc[key] !== val) return false;
    }
    return true;
  }

  _clone(doc) {
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  addIndex(fields, options = {}) {
    this.indexes.push({ fields, ...options });
  }

  _checkUnique(doc) {
    for (const idx of this.indexes) {
      if (!idx.unique) continue;
      const match = {};
      for (const f of idx.fields) {
        match[f] = doc[f];
      }
      if (idx.partialFilterExpression) {
        let pass = true;
        for (const [k, v] of Object.entries(idx.partialFilterExpression)) {
          if (doc[k] !== v) { pass = false; break; }
        }
        if (!pass) continue;
      }
      for (const existing of this.docs.values()) {
        if (existing._id === doc._id) continue;
        if (this._match(existing, match)) {
          const err = new Error(`Duplicate key: ${JSON.stringify(match)}`);
          err.code = 11000;
          throw err;
        }
      }
    }
  }
}

class InMemoryQuery {
  constructor(collection) {
    this._col = collection;
    this._filter = {};
    this._sortFields = null;
    this._selectExclude = null;
    this._selectInclude = null;
    this._limitN = null;
  }

  where(query) { this._filter = { ...this._filter, ...query }; return this; }

  sort(fields) {
    this._sortFields = fields;
    return this;
  }

  select(fields) {
    if (Array.isArray(fields)) {
      this._selectExclude = fields.map((f) => f.replace("-", ""));
    } else if (typeof fields === "string") {
      this._selectInclude = fields.split(" ");
    }
    return this;
  }

  limit(n) { this._limitN = n; return this; }

  then(resolve, reject) {
    try {
      let results = [];
      for (const doc of this._col.docs.values()) {
        if (this._col._match(doc, this._filter)) {
          results.push(this._col._clone(doc));
        }
      }
      if (this._sortFields) {
        const entries = Object.entries(this._sortFields);
        results.sort((a, b) => {
          for (const [k, dir] of entries) {
            const mul = dir >= 0 ? 1 : -1;
            if (a[k] < b[k]) return -1 * mul;
            if (a[k] > b[k]) return 1 * mul;
          }
          return 0;
        });
      }
      if (this._selectExclude) {
        results = results.map((d) => {
          const out = { ...d };
          for (const ex of this._selectExclude) delete out[ex];
          return out;
        });
      }
      if (this._limitN !== null) results = results.slice(0, this._limitN);
      resolve(results);
    } catch (e) {
      if (reject) reject(e); else throw e;
    }
  }

  [Symbol.iterator]() {
    let results = [];
    for (const doc of this._col.docs.values()) {
      if (this._col._match(doc, this._filter)) {
        results.push(this._col._clone(doc));
      }
    }
    if (this._sortFields) {
      const entries = Object.entries(this._sortFields);
      results.sort((a, b) => {
        for (const [k, dir] of entries) {
          const mul = dir >= 0 ? 1 : -1;
          if (a[k] < b[k]) return -1 * mul;
          if (a[k] > b[k]) return 1 * mul;
        }
        return 0;
      });
    }
    if (this._selectExclude) {
      results = results.map((d) => {
        const out = { ...d };
        for (const ex of this._selectExclude) delete out[ex];
        return out;
      });
    }
    if (this._limitN !== null) results = results.slice(0, this._limitN);
    return results[Symbol.iterator]();
  }
}

class InMemoryModel {
  constructor(name) {
    this.collection = new InMemoryCollection(name);
    this._schemaDefaults = {};
  }

  schema(fields) {
    for (const [k, v] of Object.entries(fields)) {
      if (v && typeof v === "object" && "default" in v) {
        this._schemaDefaults[k] = v.default;
      }
    }
    return this;
  }

  addIndex(fields, options) {
    this.collection.addIndex(fields, options);
  }

  _applyDefaults(data) {
    const doc = { ...data };
    for (const [k, v] of Object.entries(this._schemaDefaults)) {
      if (doc[k] === undefined) {
        doc[k] = typeof v === "function" ? v() : v;
      }
    }
    return doc;
  }

  _wrap(doc) {
    if (!doc) return null;
    return {
      ...doc,
      save: async () => {
        this.collection._checkUnique(doc);
        this.collection.docs.set(doc._id, doc);
      },
      select: function (fields) {
        const result = { ...doc };
        if (Array.isArray(fields)) {
          for (const f of fields) {
            const clean = f.replace("-", "");
            delete result[clean];
          }
        }
        return result;
      },
    };
  }

  async init(data) {
    const doc = this._applyDefaults(data);
    if (!doc._id) doc._id = this.collection._genId();
    this.collection._checkUnique(doc);
    this.collection.docs.set(doc._id, doc);
    return this._wrap(doc);
  }

  find(query = {}) {
    return new InMemoryQuery(this.collection).where(query);
  }

  async findOne(query = {}) {
    for (const doc of this.collection.docs.values()) {
      if (this.collection._match(doc, query)) {
        return this._wrap(this.collection._clone(doc));
      }
    }
    return null;
  }

  async findById(id) {
    const doc = this.collection.docs.get(id);
    return this._wrap(this.collection._clone(doc));
  }

  async findByIdAndUpdate(id, update) {
    const doc = this.collection.docs.get(id);
    if (!doc) return null;
    for (const [k, v] of Object.entries(update)) {
      if (k === "$set") {
        Object.assign(doc, v);
      } else {
        doc[k] = v;
      }
    }
    this.collection.docs.set(id, doc);
    return this._wrap(this.collection._clone(doc));
  }

  async updateOne(query, update) {
    for (const doc of this.collection.docs.values()) {
      if (this.collection._match(doc, query)) {
        for (const [k, v] of Object.entries(update)) {
          if (k === "$set") {
            Object.assign(doc, v);
          } else {
            doc[k] = v;
          }
        }
        return { modifiedCount: 1 };
      }
    }
    return { modifiedCount: 0 };
  }

  async deleteMany(query) {
    let count = 0;
    for (const [id, doc] of this.collection.docs.entries()) {
      if (this.collection._match(doc, query)) {
        this.collection.docs.delete(id);
        count++;
      }
    }
    return { deletedCount: count };
  }
}

const collections = {};

function getModel(name) {
  if (!collections[name]) {
    collections[name] = new InMemoryModel(name);
  }
  return collections[name];
}

export { InMemoryModel, getModel };
export default { getModel };
