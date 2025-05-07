import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CompanyForm from './CompanyForm';
import type { Company } from '../../services/companyService';
import { getCompanies, createCompany, companyService } from '../../services/companyService';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  useEffect(() => {
    getCompanies().then(data => {
      setCompanies(data);
      setIsLoading(false);
    });
  }, []);

  const handleCreateCompany = () => {
    setCurrentCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
      await companyService.remove(companyId);
      setCompanies(companies.filter(company => company.id !== companyId));
    }
  };

  const handleSaveCompany = async (formData: Partial<Company>) => {
    if (currentCompany) {
      // Actualizar empresa existente en el backend
      const updated = await companyService.update(currentCompany.id, formData);
      setCompanies(companies.map(company => 
        company.id === currentCompany.id ? updated : company
      ));
    } else {
      // Crear nueva empresa en el backend
      const newCompany = await createCompany(formData as Omit<Company, 'id'>);
      setCompanies([...companies, newCompany]);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={handleCreateCompany}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar Empresa
        </button>
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
                  NIT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.nit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay empresas registradas. Haz clic en "Agregar Empresa" para crear una.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentCompany ? 'Editar Empresa' : 'Agregar Empresa'}
                </h3>
                <CompanyForm 
                  company={currentCompany} 
                  onSave={handleSaveCompany} 
                  onCancel={() => setIsModalOpen(false)} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 