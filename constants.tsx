
import { Spot, CategoryConfig } from './types';

export const FEATURED_SPOTS: Spot[] = [
  {
    id: '1',
    name: 'Bar do Mineiro',
    description: 'A feijoada mais famosa de Santa Teresa em um ambiente histórico e boêmio.',
    category: 'Bares',
    address: 'Rua Paschoal Carlos Magno, 99',
    neighborhood: 'Santa Teresa',
    images: ['https://picsum.photos/seed/mineiro/800/600'],
    rating: 4.8,
    link: 'https://goo.gl/maps/abc'
  },
  {
    id: '2',
    name: 'Aprazível',
    description: 'Culinária brasileira refinada com uma vista deslumbrante da Baía de Guanabara.',
    category: 'Restaurantes',
    address: 'Rua Aprazível, 62',
    neighborhood: 'Santa Teresa',
    images: ['https://picsum.photos/seed/aprazivel/800/600'],
    rating: 4.9,
    link: 'https://goo.gl/maps/def'
  },
  {
    id: '3',
    name: 'Mureta da Urca',
    description: 'O melhor pôr do sol da cidade acompanhado de um casco gelado e pastéis.',
    category: 'Passeios',
    address: 'Rua Cândido Gaffrée',
    neighborhood: 'Urca',
    images: ['https://picsum.photos/seed/urca/800/600'],
    rating: 4.7,
    link: 'https://goo.gl/maps/ghi'
  },
  {
    id: '4',
    name: 'Canastra Bar',
    description: 'Vinhos brasileiros e queijos artesanais no coração de Ipanema.',
    category: 'Bares',
    address: 'Rua Jangadeiros, 42',
    neighborhood: 'Ipanema',
    images: ['https://picsum.photos/seed/canastra/800/600'],
    rating: 4.6,
    link: 'https://goo.gl/maps/jkl'
  }
];

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  { name: 'Restaurantes', icon: '🍽️', color: '#ffedd5' }, // Orange-100 equivalent
  { name: 'Bares', icon: '🍺', color: '#fef9c3' }, // Yellow-100 equivalent
  { name: 'Passeios', icon: '📸', color: '#dbeafe' }, // Blue-100 equivalent
  { name: 'Praias', icon: '🏖️', color: '#ccfbf1' }, // Teal-100 equivalent
  { name: 'Vida Noturna', icon: '💃', color: '#f3e8ff' }, // Purple-100 equivalent
];

export const INITIAL_NEIGHBORHOODS = [
  'Ipanema', 'Leblon', 'Santa Teresa', 'Urca', 'Copacabana', 'Botafogo', 'Lapa'
];
