export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
