import Database from 'better-sqlite3';
import { Expense } from './types';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(__dirname, '../expenses.db');
const db = new Database(dbPath);

export const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      merchant TEXT,
      merchant_address TEXT,
      products TEXT,
      original_input TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
  `);

  // Migration: Add user_id column if missing from earlier versions
  try {
    const tableInfo = db.prepare("PRAGMA table_info(expenses)").all() as any[];
    const hasUserId = tableInfo.some(col => col.name === 'user_id');
    if (!hasUserId) {
      db.exec("ALTER TABLE expenses ADD COLUMN user_id INTEGER DEFAULT 1");
    }
  } catch (err) {
    console.error('Migration failed:', err);
  }

  // Seed/Reset Demo User
  try {
    const hash = bcrypt.hashSync('password123', 10);
    const admin = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@example.com');
    if (!admin) {
      db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run('admin@example.com', hash, 'Admin');
      console.log('✅ Demo user seeded');
    } else {
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hash, 'admin@example.com');
      console.log('✅ Demo user password reset/verified');
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};

export const createUser = (email: string, passwordHash: string, name: string) => {
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
  const info = stmt.run(email, passwordHash, name);
  return info.lastInsertRowid;
};

export const getUserByEmail = (email: string) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const createExpense = (userId: number, expense: Expense): Expense => {
  const stmt = db.prepare(`
    INSERT INTO expenses (user_id, amount, currency, category, description, merchant, original_input)
    VALUES (?, @amount, @currency, @category, @description, @merchant, @original_input)
  `);
  
  const info = stmt.run(userId, {
    amount: expense.amount,
    currency: expense.currency || 'INR',
    category: expense.category,
    description: expense.description,
    merchant: expense.merchant,
    original_input: expense.original_input
  });

  return { ...expense, id: info.lastInsertRowid as number, user_id: userId };
};

export const getAllExpenses = (userId: number): Expense[] => {
  return db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC').all(userId) as Expense[];
};

export const deleteExpense = (userId: number, id: number): boolean => {
  const info = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
  return info.changes > 0;
};

export const updateExpense = (userId: number, id: number, updates: Partial<Expense>): boolean => {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }
  if (updates.currency !== undefined) {
    fields.push('currency = ?');
    values.push(updates.currency);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.merchant !== undefined) {
    fields.push('merchant = ?');
    values.push(updates.merchant);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.merchant_address !== undefined) {
    fields.push('merchant_address = ?');
    values.push(updates.merchant_address);
  }
  if (updates.products !== undefined) {
    fields.push('products = ?');
    values.push(updates.products);
  }

  if (fields.length === 0) return false;

  const sql = `UPDATE expenses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  const info = db.prepare(sql).run(...values, id, userId);
  return info.changes > 0;
};
