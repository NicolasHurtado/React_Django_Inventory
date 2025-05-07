import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, BuildingOffice2Icon } from '@heroicons/react/24/solid';
import authService from '../../services/authService';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setLoginError(null);
        await authService.login(values);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error al iniciar sesión:', error);
        if (error.response) {
          if (error.response.status === 401) {
            setLoginError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
          } else if (error.response.data?.detail) {
            setLoginError(error.response.data.detail);
          } else {
            setLoginError('Error al iniciar sesión. Por favor, intenta nuevamente.');
          }
        } else if (error.request) {
          setLoginError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
        } else {
          setLoginError('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300">
      <div className="max-w-md w-full space-y-8 bg-white/90 p-10 rounded-2xl shadow-2xl border border-primary-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-2 flex items-center justify-center rounded-full bg-primary-100 shadow">
            <BuildingOffice2Icon className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary-700 drop-shadow-sm">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus credenciales para acceder
          </p>
        </div>
        {loginError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative text-center animate-pulse" role="alert">
            <span className="block sm:inline">{loginError}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="rounded-md space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 sm:text-sm p-3 transition-all duration-150 outline-none ${
                  formik.touched.email && formik.errors.email ? 'border-red-500 ring-red-200' : ''
                }`}
                placeholder="ejemplo@correo.com"
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="mt-1 text-xs text-red-600 font-medium">{formik.errors.email}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary-700 mb-1">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`block w-full rounded-lg border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 sm:text-sm p-3 pr-10 transition-all duration-150 outline-none ${
                    formik.touched.password && formik.errors.password ? 'border-red-500 ring-red-200' : ''
                  }`}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <p className="mt-1 text-xs text-red-600 font-medium">{formik.errors.password}</p>
              ) : null}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 shadow-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 