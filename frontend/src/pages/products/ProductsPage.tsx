import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProductForm from './ProductForm';
import type { Product, Price } from '../../services/productService';
import { productService } from '../../services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    productService.getAll().then(data => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const handleCreateProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await productService.remove(productId);
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleSaveProduct = async (formData: Partial<Product>) => {
    if (currentProduct) {
      // Actualizar producto existente en el backend
      const updated = await productService.update(currentProduct.id, formData);
      setProducts(products.map(product => 
        product.id === currentProduct.id ? updated : product
      ));
    } else {
      // Crear nuevo producto en el backend
      const newProduct = await productService.create(formData as Omit<Product, 'id'>);
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const renderPrice = (price: number | Price) => {
    if (typeof price === 'number') {
      // Compatibilidad con productos antiguos
      return `$ ${new Intl.NumberFormat('es-CO').format(price)}`;
    }
    if (!price || typeof price !== 'object') return '-';
    // Mostrar todas las monedas disponibles
    return Object.entries(price)
      .filter(([_, val]) => val !== undefined && val !== null && !isNaN(Number(val)))
      .map(([currency, val]) => {
        let symbol = '';
        if (currency === 'COP') symbol = '$';
        else if (currency === 'USD') symbol = 'US$';
        else if (currency === 'EUR') symbol = '€';
        else symbol = currency + ' ';
        return `${symbol} ${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(Number(val))} (${currency})`;
      })
      .join(' | ');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          onClick={handleCreateProduct}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar Producto
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
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Características
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.features}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{renderPrice(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay productos registrados. Haz clic en "Agregar Producto" para crear uno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar producto */}
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
                  {currentProduct ? 'Editar Producto' : 'Agregar Producto'}
                </h3>
                <ProductForm 
                  product={currentProduct} 
                  onSave={handleSaveProduct} 
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
 