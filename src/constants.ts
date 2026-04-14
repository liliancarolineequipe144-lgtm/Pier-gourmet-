import { Category, MenuItem } from './types';

export const WHATSAPP_NUMBER = ""; // Insira o número do WhatsApp aqui (ex: 5511999999999)

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Todos', icon: 'LayoutGrid' },
  { id: 'burgers', name: 'Hambúrguer', icon: 'Beef' },
  { id: 'pastries', name: 'Pastéis', icon: 'Utensils' },
  { id: 'portions', name: 'Porções', icon: 'Utensils' },
  { id: 'drinks', name: 'Bebidas', icon: 'CupSoda' },
  { id: 'desserts', name: 'Sobremesas', icon: 'IceCream' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Pier Burger Especial',
    description: 'Pão brioche, blend bovino 160g, queijo prato, bacon crocante e maionese artesanal.',
    price: 34.90,
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Pastel de Carne (G)',
    description: 'Pastel frito na hora, recheio generoso de carne moída temperada e ovos.',
    price: 12.00,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Batata com Cheddar e Bacon',
    description: 'Porção generosa de batatas fritas cobertas com molho cheddar e farofa de bacon.',
    price: 28.00,
    category: 'portions',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Suco Natural de Laranja',
    description: 'Suco de laranja puro, extraído na hora. 500ml.',
    price: 10.00,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Petit Gâteau',
    description: 'Bolinho quente de chocolate com recheio cremoso, acompanha sorvete de baunilha.',
    price: 22.00,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
  },
];
