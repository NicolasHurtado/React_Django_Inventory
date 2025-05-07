import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import companyService from '../../services/companyService';
import type { Company } from '../../services/companyService';
import type { Price } from '../../services/productService';

interface Product {
  id: number;
  code: string;
  name: string;
  features: string;
  price: Price;
  company: number;
}

interface ProductFormProps {
  product: Product | null;
  onSave: (formData: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductSchema = Yup.object().shape({
  code: Yup.string()
    .required('El código es requerido')
    .matches(/^[A-Z0-9-]+$/, 'El código debe contener solo letras mayúsculas, números y guiones')
    .max(20, 'El código no puede exceder los 20 caracteres'),
  name: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  features: Yup.string()
    .required('Las características son requeridas')
    .max(500, 'Las características no pueden exceder los 500 caracteres'),
  price_COP: Yup.number().required('El precio en COP es requerido').positive('Debe ser positivo').typeError('Debe ser un número válido'),
  price_USD: Yup.number().positive('Debe ser positivo').typeError('Debe ser un número válido').nullable(),
  price_EUR: Yup.number().positive('Debe ser positivo').typeError('Debe ser un número válido').nullable(),
  company: Yup.number().required('La empresa es requerida'),
});

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    companyService.getAll().then(setCompanies);
  }, []);

  const formik = useFormik({
    initialValues: {
      code: product?.code || '',
      name: product?.name || '',
      features: product?.features || '',
      price_COP: product?.price?.COP || '',
      price_USD: product?.price?.USD || '',
      price_EUR: product?.price?.EUR || '',
      company: product?.company || '',
    },
    validationSchema: ProductSchema,
    onSubmit: (values) => {
      const price: Price = {
        COP: Number(values.price_COP),
      };
      if (values.price_USD !== '' && values.price_USD !== undefined) price.USD = Number(values.price_USD);
      if (values.price_EUR !== '' && values.price_EUR !== undefined) price.EUR = Number(values.price_EUR);
      onSave({
        ...values,
        price,
        company: Number(values.company),
      });
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <input
          id="code"
          name="code"
          type="text"
          placeholder="PROD-001"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.code}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.code && formik.errors.code ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.code && formik.errors.code ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.code}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="features" className="block text-sm font-medium text-gray-700">
          Características
        </label>
        <textarea
          id="features"
          name="features"
          rows={4}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.features}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.features && formik.errors.features ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.features && formik.errors.features ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.features}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="price_COP" className="block text-sm font-medium text-gray-700">
          Precio (COP) <span className="text-red-500">*</span>
        </label>
        <input
          id="price_COP"
          name="price_COP"
          type="number"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.price_COP}
          min="0"
          step="100"
          className={`block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.price_COP && formik.errors.price_COP ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.price_COP && formik.errors.price_COP ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.price_COP}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="price_USD" className="block text-sm font-medium text-gray-700">
          Precio (USD)
        </label>
        <input
          id="price_USD"
          name="price_USD"
          type="number"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.price_USD}
          min="0"
          step="0.01"
          className={`block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.price_USD && formik.errors.price_USD ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.price_USD && formik.errors.price_USD ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.price_USD}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="price_EUR" className="block text-sm font-medium text-gray-700">
          Precio (EUR)
        </label>
        <input
          id="price_EUR"
          name="price_EUR"
          type="number"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.price_EUR}
          min="0"
          step="0.01"
          className={`block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.price_EUR && formik.errors.price_EUR ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.price_EUR && formik.errors.price_EUR ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.price_EUR}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Empresa
        </label>
        <select
          id="company"
          name="company"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.company}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.company && formik.errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona una empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
        {formik.touched.company && formik.errors.company ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.company}</p>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {formik.isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
} 