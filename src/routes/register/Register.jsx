import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Toast from '../../components/ux/toast/Toast';
import { REGISTRATION_MESSAGES } from '../../utils/constants';
import Schemas from '../../utils/validation-schemas';
import { authService } from '../../service/authService';
import { AuthContext } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const { triggerAuthCheck } = useContext(AuthContext);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await authService.register(values);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setToastMessage(REGISTRATION_MESSAGES.SUCCESS);
      setToastType('success');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setToastMessage(error.message || 'Đăng ký thất bại!');
      setToastType('error');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tạo tài khoản mới để sử dụng dịch vụ của chúng tôi
            </p>
          </div>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={Schemas.signupSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ
                      </label>
                      <Field
                        name="firstName"
                        type="text"
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 
                                 rounded-md shadow-sm placeholder-gray-500 text-gray-900 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                        placeholder="Họ"
                      />
                      {errors.firstName && touched.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <Field
                        name="lastName"
                        type="text"
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 
                                 rounded-md shadow-sm placeholder-gray-500 text-gray-900 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                        placeholder="Tên"
                      />
                      {errors.lastName && touched.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                      </div>
                      <Field
                        name="email"
                        type="email"
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 
                                 rounded-md placeholder-gray-500 text-gray-900 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                        placeholder="Email"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                      </div>
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 
                                 rounded-md placeholder-gray-500 text-gray-900 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                        placeholder="Mật khẩu"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon 
                          icon={showPassword ? faEyeSlash : faEye}
                          className="text-gray-400 hover:text-gray-500"
                        />
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                      </div>
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 
                                 rounded-md placeholder-gray-500 text-gray-900 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                        placeholder="Xác nhận mật khẩu"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesomeIcon 
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="text-gray-400 hover:text-gray-500"
                        />
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent 
                             text-sm font-medium rounded-md text-white bg-indigo-600 
                             hover:bg-indigo-700 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-indigo-500 
                             transition-colors duration-200 disabled:bg-indigo-400"
                  >
                    {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {toastMessage && (
            <Toast
              type={toastType}
              message={toastMessage}
              dismissError={() => setToastMessage('')}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;