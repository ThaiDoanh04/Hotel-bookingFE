import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../../components/ux/toast/Toast';
import { REGISTRATION_MESSAGES } from '../../utils/constants';
import { Formik, Form, Field } from 'formik';
import Schemas from '../../utils/validation-schemas';
/**
 * Register Component
 * Renders a registration form that allows new users to create an account.
 */
const Register = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);

  /**
   * Simulates form submission without API
   */
  const handleSubmit = async (values) => {
    console.log('User submitted:', values); // Debugging

    // Giả lập API bằng setTimeout
    setTimeout(() => {
      setToastMessage(REGISTRATION_MESSAGES.SUCCESS);
      setToastType('success');
      setShowToast(true);
      
      // Điều hướng đến trang login sau 2s
      setTimeout(() => navigate('/login'), 2000);
    }, 1000);
  };

  return (
    <div className="register__form">
      <div className="container mx-auto p-4 flex justify-center min-h-[600px] items-center">
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={Schemas.signupSchema}
          onSubmit={handleSubmit} // Gọi hàm đã sửa
        >
          {({ errors, touched }) => (
            <Form>
              <div className="w-full max-w-lg p-4 shadow-md md:p-10">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-extrabold text-brand">
                    Join the Adventure!
                  </h2>
                  <p className="text-gray-500">
                    Create your account and start your journey with us
                  </p>
                </div>
                <div className="flex flex-wrap mb-6 -mx-3">
                  <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0 relative">
                    <Field
                      name="firstName"
                      placeholder="First Name"
                      autoComplete="given-name"
                      className={`${errors.firstName && touched.firstName ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                    />
                  </div>
                  <div className="w-full px-3 md:w-1/2">
                    <Field
                      name="lastName"
                      placeholder="Last Name"
                      autoComplete="family-name"
                      className={`${errors.lastName && touched.lastName ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <Field
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    className={`${errors.email && touched.email ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                  />
                </div>
                <div className="mb-6">
                  <Field
                    name="phoneNumber"
                    placeholder="Phone"
                    autoComplete="tel"
                    className={`${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                  />
                </div>
                <div className="mb-6">
                  <Field
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    type="password"
                    className={`${errors.password && touched.password ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                  />
                </div>
                <div className="mb-6">
                  <Field
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    type="password"
                    className={`${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''} border block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white`}
                  />
                </div>
                <div className="flex items-center w-full my-3">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 font-bold text-white rounded bg-brand hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                  >
                    Register
                  </button>
                </div>
                <Link
                  to="/login"
                  className="inline-block w-full text-lg text-center text-gray-500 align-baseline hover:text-blue-800"
                >
                  Back to login
                </Link>
                {showToast && (
                  <Toast
                    type={toastType}
                    message={toastMessage}
                    dismissError
                  />
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;
