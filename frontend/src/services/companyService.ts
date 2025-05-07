import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Company {
  id: number;
  nit: string;
  name: string;
  address: string;
  phone: string;
}

export interface CreateCompanyDto {
  nit: string;
  name: string;
  address: string;
  phone: string;
}

export interface UpdateCompanyDto {
  nit?: string;
  name?: string;
  address?: string;
  phone?: string;
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await axios.get(`${API_URL}/companies/`);
  return response.data;
};

export const createCompany = async (data: Omit<Company, 'id'>): Promise<Company> => {
  const response = await axios.post(`${API_URL}/companies/`, data);
  return response.data;
};

const getById = async (id: number): Promise<Company> => {
  try {
    const response = await axios.get<Company>(`${API_URL}/companies/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, companyData: UpdateCompanyDto): Promise<Company> => {
  try {
    const response = await axios.patch<Company>(`${API_URL}/companies/${id}/`, companyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/companies/${id}/`);
  } catch (error) {
    throw error;
  }
};

export const companyService = {
  getAll: getCompanies,
  getById,
  create: createCompany,
  update,
  remove
};

export default companyService; 