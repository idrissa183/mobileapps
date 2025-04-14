// services/products.ts
import api from './api';
import { Product, ProductFilter } from '../types/product.types';

export const getProducts = async (filters?: ProductFilter): Promise<Product[]> => {
  try {
    const response = await api.get('/clothes/products', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/clothes/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/clothes/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};