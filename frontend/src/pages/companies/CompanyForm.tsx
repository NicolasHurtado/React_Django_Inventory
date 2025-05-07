import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Company {
  id: number;
  nit: string;
  name: string;
  address: string;
  phone: string;
}

interface CompanyFormProps {
  company: Company | null;
  onSave: (formData: Partial<Company>) => void;
  onCancel: () => void;
}

const CompanySchema = Yup.object().shape({
  nit: Yup.string()
    .required('El NIT es requerido')
    .matches(/^\d{3}[.]\d{3}[.]\d{3}[-]\d{1}$/, 'Formato de NIT inválido (ej: 900.123.456-7)'),
  name: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  address: Yup.string()
    .required('La dirección es requerida')
    .max(200, 'La dirección no puede exceder los 200 caracteres'),
  phone: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^(\d{3}\s\d{3}\s\d{4}|\d{10})$/, 'Formato de teléfono inválido (ej: 601 123 4567)')
});

export default function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const formik = useFormik({
    initialValues: {
      nit: company?.nit || '',
      name: company?.name || '',
      address: company?.address || '',
      phone: company?.phone || ''
    },
    validationSchema: CompanySchema,
    onSubmit: (values) => {
      onSave(values);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
      <div>
        <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
          NIT
        </label>
        <input
          id="nit"
          name="nit"
          type="text"
          placeholder="900.123.456-7"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.nit}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.nit && formik.errors.nit ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.nit && formik.errors.nit ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.nit}</p>
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
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          id="address"
          name="address"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.address}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.address && formik.errors.address ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          placeholder="601 123 4567"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.phone}
          className={`mt-1 block w-full rounded-md sm:text-sm p-2 border ${
            formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {formik.touched.phone && formik.errors.phone ? (
          <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
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