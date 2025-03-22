import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../../components/ux/toast/Toast';
import { REGISTRATION_MESSAGES } from '../../utils/constants';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Schemas from '../../utils/validation-schemas';
import { authService } from '../../service/authService';
import { AuthContext } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Register = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const { triggerAuthCheck } = useContext(AuthContext);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await authService.register(values);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setToastMessage(REGISTRATION_MESSAGES.SUCCESS);
      setToastType('success');
      setShowToast(true);

      // Store token if returned from registration
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        triggerAuthCheck();
      }

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setToastMessage(error.message || 'Registration failed!');
      setToastType('error');
      setShowToast(true);
    }
    setSubmitting(false);
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
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
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
                  <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0">
                    <Field
                      name="firstName"
                      placeholder="First Name"
                      className={`border block w-full px-4 py-3 rounded ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="w-full px-3 md:w-1/2">
                    <Field
                      name="lastName"
                      placeholder="Last Name"
                      className={`border block w-full px-4 py-3 rounded ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`}
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div className="mb-6">
                  <Field
                    name="email"
                    placeholder="Email"
                    className={`border block w-full px-4 py-3 rounded ${errors.email && touched.email ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="mb-6">
                  <Field
                    name="phoneNumber"
                    placeholder="Phone"
                    className={`border block w-full px-4 py-3 rounded ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="mb-6">
                  <Field
                    name="password"
                    placeholder="Password"
                    type="password"
                    className={`border block w-full px-4 py-3 rounded ${errors.password && touched.password ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="mb-6">
                  <Field
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    className={`border block w-full px-4 py-3 rounded ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="flex items-center w-full my-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </div>
                <Link
                  to="/login"
                  className="block text-center text-gray-500 hover:text-blue-800"
                >
                  Back to login
                </Link>
                {showToast && <Toast type={toastType} message={toastMessage} dismissError />}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;