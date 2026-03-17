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
          content: `You are an expense parser. Extract structured expense data from the user's natural language input.
Rules:
- Extract "amount" (required, number).
- Default "currency" = "INR".
- "category" MUST be exactly one of: Food & Dining, Transport, Shopping, Entertainment, Bills & Utilities, Health, Travel, Other. If unsure, use "Other".
- Clean "description" (short summary of what was bought).
- "merchant" nullable (extract if mentioned, otherwise null).

Return ONLY valid JSON in this exact format:
{
  "amount": number,
  "currency": "INR",
  "category": "string",
  "description": "string",
  "merchant": "string" | null
}

If no amount is found or you cannot parse the expense, return:
{
  "error": "Could not parse expense. Please include an amount.",
  "amount": null
}`
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
