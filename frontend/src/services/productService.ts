import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Price {
  COP: number;
  USD?: number;
  EUR?: number;
  [key: string]: number | undefined;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  features: string;
  price: Price;
  company: number;
}

export interface CreateProductDto {
  code: string;
  name: string;
  features: string;
  price: Price;
  company: number;
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  features?: string;
  price?: Price;
  company?: number;
}

const getAll = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>(`${API_URL}/products/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number): Promise<Product> => {
  try {
    const response = await axios.get<Product>(`${API_URL}/products/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const create = async (productData: CreateProductDto): Promise<Product> => {
  try {
    const response = await axios.post<Product>(`${API_URL}/products/`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, productData: UpdateProductDto): Promise<Product> => {
  try {
    const response = await axios.patch<Product>(`${API_URL}/products/${id}/`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/products/${id}/`);
  } catch (error) {
    throw error;
  }
};

export const productService = {
  getAll,
  getById,
  create,
  update,
  remove
};

export default productService; 