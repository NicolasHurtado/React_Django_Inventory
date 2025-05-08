import { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, EnvelopeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import inventoryService from '../../services/inventoryService';
import type { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../../services/inventoryService';
import companyService from '../../services/companyService';
import productService from '../../services/productService';

interface EmailFormState {
  isOpen: boolean;
  email: string;
  isSubmitting: boolean;
}

interface InventoryFormState {
  isOpen: boolean;
  productCode: string;
  productName: string;
  quantity: number;
  companyId: string;
  isSubmitting: boolean;
  isEditing: boolean;
  editItemId: number | null;
}

export default function InventoriesPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    isOpen: false,
    email: '',
    isSubmitting: false
  });
  const [inventoryForm, setInventoryForm] = useState<InventoryFormState>({
    isOpen: false,
    productCode: '',
    productName: '',
    quantity: 0,
    companyId: '',
    isSubmitting: false,
    isEditing: false,
    editItemId: null
  });
  const [emailSent, setEmailSent] = useState(false);
  const [inventoryAdded, setInventoryAdded] = useState(false);
  const [inventoryUpdated, setInventoryUpdated] = useState(false);
  const [inventoryDeleted, setInventoryDeleted] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companies, setCompanies] = useState<{id: number, name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<{id: number, name: string, code: string}[]>([]);

  // Cargar datos del inventario
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // En producción, este sería un llamado real a la API
        const data = await inventoryService.getAll();
        setInventoryItems(data);
        
        // Obtener la lista de empresas para el filtro
        const companiesData = await companyService.getAll();
        setCompanies(companiesData.map(company => ({ 
          id: company.id, 
          name: company.name 
        })));
        
        // Obtener la lista de productos usando productService
        const productsData = await productService.getAll();
        setProducts(productsData.map((product: any) => ({
          id: product.id,
          name: product.name,
          code: product.code
        })));
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError('No se pudieron cargar los datos del inventario. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Actualizar los datos cuando cambia la empresa seleccionada
  useEffect(() => {
    const fetchInventoryByCompany = async () => {
      if (selectedCompany === 'all') return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const companyId = parseInt(selectedCompany);
        const data = await inventoryService.getByCompany(companyId);
        setInventoryItems(data);
      } catch (error) {
        console.error('Error al filtrar por empresa:', error);
        setError('No se pudieron cargar los datos del inventario. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedCompany !== 'all') {
      fetchInventoryByCompany();
    }
  }, [selectedCompany]);

  const handleDownloadPDF = async () => {
    try {
      const companyId = selectedCompany !== 'all' ? parseInt(selectedCompany) : undefined;
      const pdfBlob = await inventoryService.generatePDF(companyId);
      
      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario-${companyId ? companyId : 'completo'}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      setError('No se pudo generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const handleOpenEmailForm = () => {
    setEmailForm({
      ...emailForm,
      isOpen: true
    });
  };
  
  const handleCloseEmailForm = () => {
    setEmailForm({
      ...emailForm,
      isOpen: false
    });
  };
  
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm({
      ...emailForm,
      email: e.target.value
    });
  };
  
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.email) return;
    
    setEmailForm({
      ...emailForm,
      isSubmitting: true
    });
    
    try {
      const companyId = selectedCompany !== 'all' ? parseInt(selectedCompany) : undefined;
      await inventoryService.sendPDFByEmail(emailForm.email, companyId);
      
      setEmailForm({
        isOpen: false,
        email: '',
        isSubmitting: false
      });
      
      setEmailSent(true);
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setEmailSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      setError('No se pudo enviar el correo. Por favor, intenta de nuevo.');
      
      setEmailForm({
        ...emailForm,
        isSubmitting: false
      });
    }
  };

  const handleOpenInventoryForm = (item?: any) => {
    if (item && item.id) {
      // Modo edición
      const product = products.find(p => p.id === item.product);
      const productCode = product ? product.code : '';
      
      setInventoryForm({
        isOpen: true,
        productCode: productCode,
        productName: product ? product.name : '',
        quantity: item.quantity,
        companyId: item.company.toString(),
        isSubmitting: false,
        isEditing: true,
        editItemId: item.id
      });
    } else {
      // Modo creación
      setInventoryForm({
        ...inventoryForm,
        isOpen: true,
        companyId: selectedCompany !== 'all' ? selectedCompany : '',
        isEditing: false,
        editItemId: null
      });
    }
  };
  
  const handleCloseInventoryForm = () => {
    setInventoryForm({
      ...inventoryForm,
      isOpen: false
    });
  };
  
  const handleInventoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInventoryForm({
      ...inventoryForm,
      [name]: value
    });
  };
  
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryForm.productCode || !inventoryForm.companyId) return;
    
    setInventoryForm({
      ...inventoryForm,
      isSubmitting: true
    });
    
    try {
      // Encontrar el ID del producto basado en el código seleccionado
      const selectedProduct = products.find(p => p.code === inventoryForm.productCode);
      
      if (!selectedProduct) {
        throw new Error('Producto no encontrado');
      }
      
      if (inventoryForm.isEditing && inventoryForm.editItemId) {
        // Actualizar inventario existente
        const updateData: UpdateInventoryItemDto = {
          quantity: inventoryForm.quantity
        };
        
        await inventoryService.update(inventoryForm.editItemId, updateData);
        
        // Mostrar mensaje de éxito para actualización
        setInventoryUpdated(true);
        setTimeout(() => {
          setInventoryUpdated(false);
        }, 3000);
      } else {
        // Crear nuevo inventario
        const newItem: CreateInventoryItemDto = {
          product: selectedProduct.id,
          company: parseInt(inventoryForm.companyId),
          quantity: inventoryForm.quantity
        };
        
        await inventoryService.create(newItem);
        
        // Mostrar mensaje de éxito para creación
        setInventoryAdded(true);
        setTimeout(() => {
          setInventoryAdded(false);
        }, 3000);
      }
      
      // Actualizar la lista de inventario
      const updatedInventory = await inventoryService.getAll();
      setInventoryItems(updatedInventory);
      
      // Limpiar y cerrar el formulario
      setInventoryForm({
        isOpen: false,
        productCode: '',
        productName: '',
        quantity: 0,
        companyId: '',
        isSubmitting: false,
        isEditing: false,
        editItemId: null
      });
      
    } catch (error) {
      console.error('Error al procesar el elemento de inventario:', error);
      setError('No se pudo procesar la operación. Por favor, intenta de nuevo.');
      
      setInventoryForm({
        ...inventoryForm,
        isSubmitting: false
      });
    }
  };

  const handleDeleteClick = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar propagación al tr
    setDeletingItemId(item.id);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingItemId(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingItemId === null) return;
    
    try {
      await inventoryService.remove(deletingItemId);
      
      // Actualizar la lista eliminando el item
      const updatedInventory = await inventoryService.getAll();
      setInventoryItems(updatedInventory);
      
      // Mostrar mensaje de éxito
      setInventoryDeleted(true);
      setTimeout(() => {
        setInventoryDeleted(false);
      }, 3000);
      
      // Cerrar el modal
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
    } catch (error) {
      console.error('Error al eliminar el elemento:', error);
      setError('No se pudo eliminar el elemento. Por favor, intenta de nuevo.');
    }
  };

  // Lista filtrada de elementos de inventario
  const filteredItems = inventoryItems.map(item => {
    // Buscar el producto y la empresa por ID
    const product = products.find(p => p.id === item.product);
    const company = companies.find(c => c.id === item.company);
    return {
      ...item,
      productCode: product ? product.code : '',
      productName: product ? product.name : '',
      companyName: company ? company.name : ''
    };
  }).filter(item => {
    if (selectedCompany === 'all') return true;
    return item.company === parseInt(selectedCompany);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-600">Gestiona y visualiza el inventario actual de productos por empresa.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-4">
            <label htmlFor="companyFilter" className="block text-sm font-medium text-gray-700">
              Filtrar por empresa:
            </label>
            <select
              id="companyFilter"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todas las empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id.toString()}>{company.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleOpenInventoryForm()}
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Agregar Inventario
            </button>
            
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Descargar PDF
            </button>
            
            <button
              onClick={handleOpenEmailForm}
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Enviar por Correo
            </button>
          </div>
        </div>
        
        {emailSent && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            El PDF del inventario ha sido enviado exitosamente por correo electrónico.
          </div>
        )}
        
        {inventoryAdded && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            El elemento ha sido agregado exitosamente al inventario.
          </div>
        )}
        
        {inventoryUpdated && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            El elemento ha sido actualizado exitosamente.
          </div>
        )}
        
        {inventoryDeleted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            El elemento ha sido eliminado exitosamente.
          </div>
        )}
        
        {/* Modal para enviar correo */}
        {emailForm.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={handleCloseEmailForm}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div 
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Enviar Inventario por Correo
                  </h3>
                  
                  <form onSubmit={handleSendEmail}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Correo electrónico:
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={emailForm.email}
                        onChange={handleEmailInputChange}
                        required
                        placeholder="ejemplo@correo.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseEmailForm}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancelar
                      </button>
                      
                      <button
                        type="submit"
                        disabled={emailForm.isSubmitting}
                        className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {emailForm.isSubmitting ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar/editar inventario */}
        {inventoryForm.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={handleCloseInventoryForm}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div 
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {inventoryForm.isEditing ? 'Editar Elemento de Inventario' : 'Agregar Elemento al Inventario'}
                  </h3>
                  
                  <form onSubmit={handleAddInventory}>
                    <div className="mb-4">
                      <label htmlFor="productCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Producto:
                      </label>
                      <select
                        id="productCode"
                        name="productCode"
                        value={inventoryForm.productCode}
                        onChange={handleInventoryInputChange}
                        required
                        disabled={inventoryForm.isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${inventoryForm.isEditing ? 'bg-gray-100' : ''}`}
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.code}>{product.name} ({product.code})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="0"
                        value={inventoryForm.quantity}
                        onChange={handleInventoryInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa:
                      </label>
                      <select
                        id="companyId"
                        name="companyId"
                        value={inventoryForm.companyId}
                        onChange={handleInventoryInputChange}
                        required
                        disabled={inventoryForm.isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${inventoryForm.isEditing ? 'bg-gray-100' : ''}`}
                      >
                        <option value="">Seleccionar empresa</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id.toString()}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseInventoryForm}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancelar
                      </button>
                      
                      <button
                        type="submit"
                        disabled={inventoryForm.isSubmitting}
                        className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {inventoryForm.isSubmitting 
                          ? (inventoryForm.isEditing ? 'Actualizando...' : 'Guardando...') 
                          : (inventoryForm.isEditing ? 'Actualizar' : 'Guardar')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de creación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleOpenInventoryForm(item)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(item, e)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay elementos de inventario disponibles para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={handleCancelDelete}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar elemento
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 