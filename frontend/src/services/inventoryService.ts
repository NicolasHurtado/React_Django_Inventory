import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interfaz que refleja los datos crudos que llegan del backend
export interface InventoryItem {
  id: number;
  quantity: number;
  created_at: string;
  company: number;
  product: number;
  // Estos campos podrían existir en respuestas enriquecidas
  product_name?: string;
  product_code?: string;
  company_name?: string;
}

// Interfaz para los datos procesados que usa el frontend
export interface InventoryItemSummary {
  id: number;
  quantity: number;
  product: number;
  company: number;
  created_at: string;
  // Campos calculados para la UI
  productCode?: string;
  productName?: string;
  companyName?: string;
  lastUpdated?: string;
}

export interface CreateInventoryItemDto {
  product: number;
  company: number;
  quantity: number;
}

export interface UpdateInventoryItemDto {
  quantity?: number;
}

/**
 * Obtiene todos los elementos del inventario
 */
const getAll = async (): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get<InventoryItem[]>(`${API_URL}/inventories/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los elementos de inventario filtrados por empresa
 * @param companyId ID de la empresa a filtrar
 */
const getByCompany = async (companyId: number): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get<InventoryItem[]>(`${API_URL}/inventories/?company=${companyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un elemento de inventario por su ID
 * @param id ID del elemento a obtener
 */
const getById = async (id: number): Promise<InventoryItem> => {
  try {
    const response = await axios.get<InventoryItem>(`${API_URL}/inventories/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un nuevo elemento de inventario
 * @param inventoryData Datos del nuevo elemento
 */
const create = async (inventoryData: CreateInventoryItemDto): Promise<InventoryItem> => {
  try {
    const response = await axios.post<InventoryItem>(`${API_URL}/inventories/`, inventoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza un elemento de inventario existente
 * @param id ID del elemento a actualizar
 * @param inventoryData Datos a actualizar
 */
const update = async (id: number, inventoryData: UpdateInventoryItemDto): Promise<InventoryItem> => {
  try {
    const response = await axios.patch<InventoryItem>(`${API_URL}/inventories/${id}/`, inventoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un elemento de inventario
 * @param id ID del elemento a eliminar
 */
const remove = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/inventories/${id}/`);
  } catch (error) {
    throw error;
  }
};

/**
 * Genera y descarga el PDF del inventario
 * @param companyId ID de la empresa (opcional)
 */
const generatePDF = async (companyId?: number): Promise<Blob> => {
  try {
    const url = companyId 
      ? `${API_URL}/inventories/download_pdf/` 
      : `${API_URL}/inventories/download_pdf/`;
    
    const response = await axios.get(url, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Envía el PDF del inventario por correo electrónico
 * @param email Correo electrónico del destinatario
 * @param companyId ID de la empresa (opcional)
 */
const sendPDFByEmail = async (email: string, companyId?: number): Promise<void> => {
  try {
    const url = `${API_URL}/inventories/send_email/`;
    await axios.post(url, {
      email,
      company_id: companyId
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