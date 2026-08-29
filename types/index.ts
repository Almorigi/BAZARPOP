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
  avg_rating?: number | null;
  review_count?: number | null;
  video_url?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
