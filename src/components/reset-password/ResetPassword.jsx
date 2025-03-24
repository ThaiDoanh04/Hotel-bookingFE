import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useToast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values) => {
    try {
      const requestData = {
        email: location.state.email,
        otpCode: location.state.otpCode,
        newPassword: values.password,
        confirmPassword: values.confirmPassword
      };

      const response = await axios.post('/api/auth/reset-password', requestData);

      if (response.data.success) {
        toast.success('Mật khẩu đã được cập nhật thành công!');
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra khi cập nhật mật khẩu');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faLock} className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đặt lại mật khẩu
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </div>

          <Formik
            initialValues={{
              password: '',
              confirmPassword: ''
            }}
            validationSchema={Yup.object({
              password: Yup.string()
                .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
                .required('Vui lòng nhập mật khẩu mới'),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
                .required('Vui lòng xác nhận mật khẩu')
            })}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mật khẩu mới
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                 rounded-md shadow-sm placeholder-gray-400 
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu mới"
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
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Xác nhận mật khẩu
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                 rounded-md shadow-sm placeholder-gray-400 
                                 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Xác nhận mật khẩu mới"
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
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent 
                             rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                             hover:bg-blue-700 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 