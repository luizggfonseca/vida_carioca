
export interface Spot {
  id: string;
  name: string;
  description: string;
  category: string;
  address?: string;
  images: string[];
  rating: number;
  neighborhood: string;
  link?: string;
}

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type Language = 'pt' | 'en' | 'es';
