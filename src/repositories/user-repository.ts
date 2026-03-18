import { pool } from "../lib/db";

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  provider: string;
  provider_id: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const { email, name, password_hash, provider, provider_id, role } = userData;
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash, provider, provider_id, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [email, name, password_hash, provider || "local", provider_id, role || "user"]
    );
    return rows[0];
  }

  async updateLastLogin(id: string): Promise<void> {
    await pool.query("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  }
}
