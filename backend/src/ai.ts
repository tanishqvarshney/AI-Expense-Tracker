import OpenAI from 'openai';
import { ParsedExpense } from './types';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  baseURL: process.env.OPENAI_BASE_URL
});

const VALID_CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Health', 'Travel', 'Other'
];

export const parseExpense = async (text: string): Promise<ParsedExpense> => {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a financial data extraction engine. Extract structured expense information from natural language.

Rules:
1. "amount": Required number.
2. "currency": Default "INR".
3. "category": Must be one of: Food & Dining, Transport, Shopping, Entertainment, Bills & Utilities, Health, Travel, Other.
4. "description": Brief summary.
5. "merchant": Specific name if available.

Examples:
- "Spent 200 on Coffee at Starbucks" -> {"amount": 200, "currency": "INR", "category": "Food & Dining", "description": "Coffee", "merchant": "Starbucks"}
- "Electricity bill 1500" -> {"amount": 1500, "currency": "INR", "category": "Bills & Utilities", "description": "Electricity bill", "merchant": null}
- "Gas for 50 USD" -> {"amount": 50, "currency": "USD", "category": "Transport", "description": "Gas", "merchant": null}

Return ONLY valid JSON.`
        },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    
    if (parsed.error || parsed.amount === null || parsed.amount === undefined) {
      return {
        error: parsed.error || "Could not parse expense. Please include an amount.",
        amount: null,
        currency: 'INR',
        category: 'Other',
        description: '',
        merchant: null
      };
    }

    if (!VALID_CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Other';
    }

    return parsed as ParsedExpense;
  } catch (error) {
    console.error('AI Parsing Error:', error);
    return {
      error: "Error communicating with AI service.",
      amount: null,
      currency: 'INR',
      category: 'Other',
      description: '',
      merchant: null
    };
  }
};

export const analyzeDashboard = async (query: string, expenses: any[]): Promise<string> => {
  try {
    const summary = expenses.map(e => `${e.merchant || e.description}: ${e.currency} ${e.amount} (${e.category})`).join('\n');
    
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI financial assistant. Analyze the following expense data and answer the user's question concisely.
          
Data:
${summary}

Keep your answer under 2 sentences and be conversational.`
        },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content || "I couldn't analyze the data right now.";
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return "Error analyzing dashboard data.";
  }
};
