export type Category = "fumetti" | "libri" | "videogiochi" | "oggetti" | "dvd";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number; // in centesimi
  category: Category;
  condition: "nuovo" | "ottimo" | "buono" | "discreto";
  stock: number;
  images: string[];
  slug: string;
  created_at: string;
  sold: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
