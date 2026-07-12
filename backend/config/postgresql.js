import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const sql = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

const initDB = async () => {
  await sql(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      image TEXT DEFAULT '',
      address JSONB DEFAULT '{"line1":"","line2":""}',
      gender VARCHAR(50) DEFAULT 'Not Selected',
      dob VARCHAR(50) DEFAULT 'Not Selected',
      phone VARCHAR(20) DEFAULT '000000000'
    );
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS doctors (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      image TEXT DEFAULT '',
      speciality VARCHAR(255) NOT NULL,
      degree VARCHAR(255) DEFAULT '',
      experience VARCHAR(100) DEFAULT '',
      about TEXT DEFAULT '',
      available BOOLEAN DEFAULT true,
      fees NUMERIC DEFAULT 0,
      address JSONB DEFAULT '{"line1":"","line2":""}',
      created_at BIGINT DEFAULT 0,
      slots_booked JSONB DEFAULT '{}'
    );
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      doc_id VARCHAR(64) NOT NULL,
      slot_date VARCHAR(50) NOT NULL,
      slot_time VARCHAR(50) NOT NULL,
      user_data JSONB NOT NULL,
      doc_data JSONB NOT NULL,
      amount NUMERIC NOT NULL,
      created_at BIGINT NOT NULL,
      cancelled BOOLEAN DEFAULT false,
      is_completed BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'pending'
    );
  `);

  await sql(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
    ON appointments (doc_id, slot_date, slot_time)
    WHERE cancelled = false;
  `);

  console.log("PostgreSQL tables ready");
};

export { sql, initDB };
export default pool;
