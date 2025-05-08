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
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyDeleted, setCompanyDeleted] = useState(false);

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

  const handleDeleteClick = (companyId: number) => {
    setDeletingCompanyId(companyId);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingCompanyId(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingCompanyId === null) return;
    
    try {
      await companyService.remove(deletingCompanyId);
      // Actualizar la lista eliminando la empresa
      setCompanies(companies.filter(company => company.id !== deletingCompanyId));
      
      // Mostrar mensaje de éxito
      setCompanyDeleted(true);
      setTimeout(() => {
        setCompanyDeleted(false);
      }, 3000);
      
      // Cerrar el modal
      setShowDeleteConfirm(false);
      setDeletingCompanyId(null);
    } catch (error) {
      console.error('Error al eliminar la empresa:', error);
      // Aquí podrías manejar el error, por ejemplo mostrando un mensaje
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

      {companyDeleted && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          La empresa ha sido eliminada exitosamente.
        </div>
      )}

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
                      onClick={() => handleDeleteClick(company.id)}
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
                      Eliminar empresa
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.
                        Todos los productos e inventarios asociados a esta empresa también serán eliminados.
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