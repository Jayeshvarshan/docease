import mysql from "mysql2/promise";

let pool = null;

const getPool = () => {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    const isLocal = url?.includes("localhost");

    const config = {
      uri: url,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    };

    if (!isLocal) {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = mysql.createPool(config);
  }
  return pool;
};

const query = async (text, params) => {
  const p = getPool();
  const [rows] = await p.query(text, params);
  return rows;
};

const initDB = async () => {
  const p = getPool();

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        image TEXT,
        address JSON,
        gender VARCHAR(50) DEFAULT 'Not Selected',
        dob VARCHAR(50) DEFAULT 'Not Selected',
        phone VARCHAR(20) DEFAULT '000000000'
      )
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT '',
        image TEXT,
        speciality VARCHAR(255) NOT NULL,
        degree VARCHAR(255) DEFAULT '',
        experience VARCHAR(100) DEFAULT '',
        about TEXT,
        available BOOLEAN DEFAULT true,
        fees DECIMAL(10,2) DEFAULT 0,
        address JSON,
        created_at BIGINT DEFAULT 0,
        slots_booked JSON
      )
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        doc_id VARCHAR(64) NOT NULL,
        slot_date VARCHAR(50) NOT NULL,
        slot_time VARCHAR(50) NOT NULL,
        user_data JSON NOT NULL,
        doc_data JSON NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at BIGINT NOT NULL,
        cancelled BOOLEAN DEFAULT false,
        is_completed BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'pending',
        UNIQUE KEY unique_active_app (doc_id, slot_date, slot_time)
      )
    `);

    console.log("MySQL tables ready");
  } catch (err) {
    console.error("DB init error:", err.message);
    throw err;
  }
};

export { query, initDB };
export default getPool;
