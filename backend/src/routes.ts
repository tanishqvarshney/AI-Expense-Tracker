import { Router, Request, Response } from 'express';
import { createExpense, getAllExpenses, deleteExpense, createUser, getUserByEmail } from './db';
import { parseExpense } from './ai';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = createUser(email, hash, name);
    res.json({ success: true, data: { id, email, name } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Signup failed' });
  }
});

router.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: any = getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/api/expenses', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    const userId = parseInt(req.get('X-User-Id') || '');
    
    if (isNaN(userId)) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing User ID' });
    }

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ success: false, error: 'Input is required' });
    }

    const parsed = await parseExpense(input);

    if (parsed.error || parsed.amount === null) {
      return res.status(400).json({ success: false, error: parsed.error || 'Invalid expense data' });
    }

    const expense = createExpense(userId, {
      amount: parsed.amount,
      currency: parsed.currency || 'INR',
      category: parsed.category,
      description: parsed.description,
      merchant: parsed.merchant,
      original_input: input
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/api/expenses', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.get('X-User-Id') || '');
    if (isNaN(userId)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const expenses = getAllExpenses(userId);
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.get('X-User-Id') || '');

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID or Unauthorized' });
    }

    const deleted = deleteExpense(userId, id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Expense not found or unauthorized' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { merchant_address, products } = req.body;
    const userId = parseInt(req.get('X-User-Id') || '');
    
    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID or Unauthorized' });
    }

    const { updateExpense } = require('./db');
    const updated = updateExpense(userId, id, { merchant_address, products });
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Expense not found or no changes made' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { query, data } = req.body;
    if (!query || !data) {
      return res.status(400).json({ success: false, error: 'Query and data are required' });
    }

    const { analyzeDashboard } = require('./ai');
    const answer = await analyzeDashboard(query, data);
    res.json({ success: true, data: answer });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
