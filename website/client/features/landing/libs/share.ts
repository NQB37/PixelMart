export const accentBg = {
  cyan: "bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan",
  pink: "bg-neon-pink/10 hover:bg-neon-pink/20 border-neon-pink",
  green: "bg-neon-green/10 hover:bg-neon-green/20 border-neon-green",
  yellow: "bg-neon-yellow/10 hover:bg-neon-yellow/20 border-neon-yellow",
};

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  badge?: string;
  emoji: string;
  accent: "cyan" | "pink" | "green" | "yellow";
}
