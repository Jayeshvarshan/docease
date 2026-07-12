import { query } from "../config/mysql.js";
import { randomUUID } from "crypto";

const appointmentModel = {
  async findOne(q) {
    const keys = Object.keys(q);
    const conditions = keys.map((k) => {
      const v = q[k];
      if (typeof v === "object" && v !== null && "$ne" in v) return `${k} != ?`;
      return `${k} = ?`;
    });
    const vals = keys.map((k) => {
      const v = q[k];
      if (typeof v === "object" && v !== null && "$ne" in v) return v.$ne;
      return v;
    });
    const where = conditions.join(" AND ");
    const rows = await query(`SELECT * FROM appointments WHERE ${where} LIMIT 1`, vals);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query("SELECT * FROM appointments WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = randomUUID().replace(/-/g, "").slice(0, 24);
    await query(
      `INSERT INTO appointments (id, user_id, doc_id, slot_date, slot_time, user_data, doc_data, amount, created_at, cancelled, is_completed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.userId, data.docId, data.slotDate, data.slotTime,
        JSON.stringify(data.userData), JSON.stringify(data.docData),
        data.amount, data.date, data.cancelled || false, data.isCompleted || false, data.status || "pending",
      ]
    );
    return this.findById(id);
  },

  async updateById(id, data) {
    const colMap = {
      userId: "user_id", docId: "doc_id", slotDate: "slot_date",
      slotTime: "slot_time", userData: "user_data", docData: "doc_data",
      isCompleted: "is_completed",
    };
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    if (keys.length === 0) return;
    const set = keys.map((k) => `${colMap[k] || k} = ?`).join(", ");
    const vals = keys.map((k) => (typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]));
    vals.push(id);
    await query(`UPDATE appointments SET ${set} WHERE id = ?`, vals);
  },

  async find(q = {}) {
    const colMap = {
      userId: "user_id", docId: "doc_id", slotDate: "slot_date",
      slotTime: "slot_time", user_id: "user_id", doc_id: "doc_id",
    };
    const keys = Object.keys(q);
    if (keys.length === 0) return query("SELECT * FROM appointments ORDER BY created_at DESC");
    const where = keys.map((k) => `${colMap[k] || k} = ?`).join(" AND ");
    return query(`SELECT * FROM appointments WHERE ${where} ORDER BY created_at DESC`, keys.map((k) => q[k]));
  },
};

export default appointmentModel;
