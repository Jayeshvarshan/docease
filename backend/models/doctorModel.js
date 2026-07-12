import { query } from "../config/mysql.js";
import { randomUUID } from "crypto";

const doctorModel = {
  async findOne(q) {
    const keys = Object.keys(q);
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    const rows = await query(`SELECT * FROM doctors WHERE ${where} LIMIT 1`, keys.map((k) => q[k]));
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query("SELECT * FROM doctors WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = randomUUID().replace(/-/g, "").slice(0, 24);
    await query(
      `INSERT INTO doctors (id, name, email, password, phone, image, speciality, degree, experience, about, available, fees, address, created_at, slots_booked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name, data.email, data.password, data.phone || "", data.image || "",
        data.speciality, data.degree || "", data.experience || "", data.about || "",
        data.available !== undefined ? data.available : true, data.fees || 0,
        JSON.stringify(data.address || { line1: "", line2: "" }),
        data.date || Date.now(), JSON.stringify(data.slots_booked || {}),
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
    await query(`UPDATE doctors SET ${set} WHERE id = ?`, vals);
  },

  async findAll() {
    return query("SELECT * FROM doctors ORDER BY created_at DESC");
  },

  async find(q = {}) {
    const keys = Object.keys(q);
    if (keys.length === 0) return this.findAll();
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    return query(`SELECT * FROM doctors WHERE ${where} ORDER BY created_at DESC`, keys.map((k) => q[k]));
  },
};

export default doctorModel;
