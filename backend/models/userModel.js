import { query } from "../config/mysql.js";
import { randomUUID } from "crypto";

const userModel = {
  async findOne(q) {
    const keys = Object.keys(q);
    const where = keys.map((k, i) => `${k} = ?`).join(" AND ");
    const rows = await query(`SELECT * FROM users WHERE ${where} LIMIT 1`, keys.map((k) => q[k]));
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = randomUUID().replace(/-/g, "").slice(0, 24);
    await query(
      `INSERT INTO users (id, name, email, password, image, address, gender, dob, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name, data.email, data.password, data.image || "",
        JSON.stringify(data.address || { line1: "", line2: "" }),
        data.gender || "Not Selected", data.dob || "Not Selected", data.phone || "000000000",
      ]
    );
    return this.findById(id);
  },

  async updateById(id, data) {
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${k} = ?`).join(", ");
    const vals = keys.map((k) => (typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]));
    vals.push(id);
    await query(`UPDATE users SET ${set} WHERE id = ?`, vals);
  },

  async find(q = {}) {
    const keys = Object.keys(q);
    if (keys.length === 0) return query("SELECT * FROM users ORDER BY id");
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    return query(`SELECT * FROM users WHERE ${where} ORDER BY id`, keys.map((k) => q[k]));
  },
};

export default userModel;
