import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const getMerchantLogo = (name: string): string | null => {
  const n = name.toLowerCase();
  const domains: Record<string, string> = {
    'starbucks': 'starbucks.com',
    'swiggy': 'swiggy.com',
    'zomato': 'zomato.com',
    'uber': 'uber.com',
    'amazon': 'amazon.in',
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'apple': 'apple.com',
    'ola': 'olacabs.com',
    'flipkart': 'flipkart.com',
    'mcdonalds': 'mcdonalds.com',
    'kfc': 'kfc.com',
    'mariott': 'marriott.com',
    'hilton': 'hilton.com',
    'playstation': 'playstation.com',
    'xbox': 'xbox.com',
    'steam': 'steampowered.com',
    'nintendo': 'nintendo.com'
  };

  for (const [key, domain] of Object.entries(domains)) {
    if (n.includes(key)) return `https://logo.clearbit.com/${domain}`;
  }
  return null;
};

export const getMerchantIcon = (name: string): IconName => {
  const n = name.toLowerCase();
  
  // Specific Merchant/Service Keywords
  if (n.includes('starbucks') || n.includes('coffee') || n.includes('cafe')) return 'coffee';
  if (n.includes('hotel') || n.includes('stay') || n.includes('resort') || n.includes('airbnb') || n.includes('mariott') || n.includes('hilton')) return 'bed-outline';
  if (n.includes('gaming') || n.includes('game') || n.includes('playstation') || n.includes('xbox') || n.includes('steam')) return 'controller-classic';
  if (n.includes('swiggy') || n.includes('zomato') || n.includes('food') || n.includes('eats')) return 'food';
  if (n.includes('uber') || n.includes('taxi') || n.includes('ola') || n.includes('careem') || n.includes('bykea')) return 'car';
  if (n.includes('amazon') || n.includes('shopping') || n.includes('flipkart') || n.includes('daraz')) return 'cart';
  if (n.includes('netflix') || n.includes('spotify') || n.includes('entertainment') || n.includes('cinema') || n.includes('movie')) return 'play-circle';
  if (n.includes('gym') || n.includes('health') || n.includes('fitness')) return 'heart-pulse';
  if (n.includes('apple') || n.includes('tech') || n.includes('gadget') || n.includes('samsung')) return 'laptop';
  
  // Utilities & Essentials
  if (n.includes('electricity') || n.includes('power') || n.includes('bill')) return 'lightning-bolt';
  if (n.includes('water')) return 'water';
  if (n.includes('internet') || n.includes('wifi') || n.includes('broadband')) return 'wifi';
  if (n.includes('grocery') || n.includes('market') || n.includes('super')) return 'basket-outline';
  if (n.includes('pharmacy') || n.includes('medicine') || n.includes('doctor')) return 'pill';
  if (n.includes('rent') || n.includes('home') || n.includes('apartment')) return 'home-city';
  if (n.includes('insurance')) return 'shield-check';
  if (n.includes('school') || n.includes('education') || n.includes('books') || n.includes('fees')) return 'book-open-variant';
  if (n.includes('gift') || n.includes('present')) return 'gift-outline';
  
  return 'tag';
};

export const getCategoryIcon = (category: string): IconName => {
  const c = category.toLowerCase();
  if (c.includes('food') || c.includes('dining') || c.includes('coffee')) return 'food';
  if (c.includes('travel') || c.includes('transport') || c.includes('hotel') || c.includes('stay')) return 'airplane';
  if (c.includes('gaming') || c.includes('entertainment') || c.includes('leisure')) return 'controller-classic';
  if (c.includes('shopping') || c.includes('grocery')) return 'cart';
  if (c.includes('bill') || c.includes('utility') || c.includes('electricity') || c.includes('water')) return 'receipt';
  if (c.includes('health') || c.includes('medicine')) return 'medical-bag';
  if (c.includes('rent') || c.includes('housing')) return 'home-city';
  if (c.includes('education') || c.includes('books')) return 'book-open-variant';
  if (c.includes('gift')) return 'gift-outline';
  return 'dots-horizontal-circle';
};
