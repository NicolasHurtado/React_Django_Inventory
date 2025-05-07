import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface InventoryItem {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  company: number;
  company_name: string;
  quantity: number;
  last_updated: string;
}

export interface InventoryItemSummary {
  id: number;
  productCode: string;
  productName: string;
  quantity: number;
  companyName: string;
  lastUpdated: string;
}

export interface CreateInventoryItemDto {
  product: number;
  company: number;
  quantity: number;
}

export interface UpdateInventoryItemDto {
  quantity?: number;
}

const getAll = async (): Promise<InventoryItemSummary[]> => {
  try {
    const response = await axios.get<InventoryItem[]>(`${API_URL}/inventories/`);
    // Transformar la respuesta al formato que espera la UI
    return response.data.map(item => ({
      id: item.id,
      productCode: item.product_code,
      productName: item.product_name,
      quantity: item.quantity,
      companyName: item.company_name,
      lastUpdated: item.last_updated
    }));
  } catch (error) {
    throw error;
  }
};

const getByCompany = async (companyId: number): Promise<InventoryItemSummary[]> => {
  try {
    const response = await axios.get<InventoryItem[]>(`${API_URL}/inventories/?company=${companyId}`);
    return response.data.map(item => ({
      id: item.id,
      productCode: item.product_code,
      productName: item.product_name,
      quantity: item.quantity,
      companyName: item.company_name,
      lastUpdated: item.last_updated
    }));
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number): Promise<InventoryItemSummary> => {
  try {
    const response = await axios.get<InventoryItem>(`${API_URL}/inventories/${id}/`);
    return {
      id: response.data.id,
      productCode: response.data.product_code,
      productName: response.data.product_name,
      quantity: response.data.quantity,
      companyName: response.data.company_name,
      lastUpdated: response.data.last_updated
    };
  } catch (error) {
    throw error;
  }
};

const create = async (inventoryData: CreateInventoryItemDto): Promise<InventoryItemSummary> => {
  try {
    const response = await axios.post<InventoryItem>(`${API_URL}/inventories/`, inventoryData);
    return {
      id: response.data.id,
      productCode: response.data.product_code,
      productName: response.data.product_name,
      quantity: response.data.quantity,
      companyName: response.data.company_name,
      lastUpdated: response.data.last_updated
    };
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, inventoryData: UpdateInventoryItemDto): Promise<InventoryItemSummary> => {
  try {
    const response = await axios.patch<InventoryItem>(`${API_URL}/inventories/${id}/`, inventoryData);
    return {
      id: response.data.id,
      productCode: response.data.product_code,
      productName: response.data.product_name,
      quantity: response.data.quantity,
      companyName: response.data.company_name,
      lastUpdated: response.data.last_updated
    };
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/inventories/${id}/`);
  } catch (error) {
    throw error;
  }
};

// Generar y descargar el PDF del inventario
const generatePDF = async (companyId?: number): Promise<Blob> => {
  try {
    const url = companyId 
      ? `${API_URL}/inventories/pdf/?company=${companyId}` 
      : `${API_URL}/inventories/pdf/`;
    
    const response = await axios.get(url, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Enviar el PDF por correo electrónico
const sendPDFByEmail = async (email: string, companyId?: number): Promise<void> => {
  try {
    const url = `${API_URL}/inventories/send_pdf/`;
    await axios.post(url, {
      email,
      company: companyId
    });
  } catch (error) {
    throw error;
  }
};

export const inventoryService = {
  getAll,
  getByCompany,
  getById,
  create,
  update,
  remove,
  generatePDF,
  sendPDFByEmail
};

export default inventoryService; 