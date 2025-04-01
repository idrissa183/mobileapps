// types/product.types.ts
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export type Color = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrls: string[];
  colors: Color[];
  sizes: Size[];
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
};

export type ProductFilter = {
  categories?: string[];
  brands?: string[];
  sizes?: Size[];
  colors?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
};