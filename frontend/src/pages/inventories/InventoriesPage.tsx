import { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import inventoryService, { InventoryItemSummary } from '../../services/inventoryService';
import companyService from '../../services/companyService';

interface EmailFormState {
  isOpen: boolean;
  email: string;
  isSubmitting: boolean;
}

export default function InventoriesPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    isOpen: false,
    email: '',
    isSubmitting: false
  });
  const [emailSent, setEmailSent] = useState(false);
  const [companies, setCompanies] = useState<{id: number, name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Lista filtrada de elementos de inventario
  const filteredItems = selectedCompany === 'all' 
    ? inventoryItems 
    : inventoryItems.filter(item => {
        const company = companies.find(c => c.id === parseInt(selectedCompany));
        return company && item.companyName === company.name;
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
                  Última Actualización
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastUpdated}</td>
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
    </div>
  );
} 