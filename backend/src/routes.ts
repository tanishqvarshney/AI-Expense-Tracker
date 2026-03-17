import { Router, Request, Response } from 'express';
import { createExpense, getAllExpenses, deleteExpense, createUser, getUserByEmail, updateExpense } from './db';
import { parseExpense, analyzeDashboard } from './ai';
import bcrypt from 'bcryptjs';
import { catchAsync } from './utils/catchAsync';
import { AppError } from './middleware/error.middleware';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.post('/api/signup', catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    throw new AppError('Missing fields', 400);
  }

  const existing = getUserByEmail(email);
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const hash = await bcrypt.hash(password, 10);
  const id = createUser(email, hash, name);
  res.json({ success: true, data: { id, email, name } });
}));

router.post('/api/login', catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user: any = getUserByEmail(email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 400);
  }

  res.json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
}));

router.post('/api/expenses', catchAsync(async (req: Request, res: Response) => {
  const { input } = req.body;
  const userId = parseInt(req.get('X-User-Id') || '');
  
  if (isNaN(userId)) throw new AppError('Unauthorized', 401);
  if (!input) throw new AppError('Input is required', 400);

  const parsed = await parseExpense(input);
  if (parsed.error || parsed.amount === null) {
    throw new AppError(parsed.error || 'Invalid expense data', 400);
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
}));

router.get('/api/expenses', catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(req.get('X-User-Id') || '');
  if (isNaN(userId)) throw new AppError('Unauthorized', 401);

  const expenses = getAllExpenses(userId);
  res.json({ success: true, data: expenses });
}));

router.delete('/api/expenses/:id', catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const userId = parseInt(req.get('X-User-Id') || '');

  if (isNaN(id) || isNaN(userId)) throw new AppError('Invalid ID or Unauthorized', 400);

  const deleted = deleteExpense(userId, id);
  if (!deleted) throw new AppError('Expense not found or unauthorized', 404);

  res.json({ success: true });
}));

router.patch('/api/expenses/:id', catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const userId = parseInt(req.get('X-User-Id') || '');
  
  if (isNaN(id) || isNaN(userId)) throw new AppError('Invalid ID or Unauthorized', 400);

  const updated = updateExpense(userId, id, req.body);
  if (!updated) throw new AppError('Expense not found or no changes made', 404);

  res.json({ success: true });
}));

router.post('/api/analyze', catchAsync(async (req: Request, res: Response) => {
  const { query, data } = req.body;
  if (!query || !data) throw new AppError('Query and data are required', 400);

  const answer = await analyzeDashboard(query, data);
  res.json({ success: true, data: answer });
}));

export default router;
