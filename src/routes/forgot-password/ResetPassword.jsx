import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from '../../utils/request';
import Toast from '../../components/ux/toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otpCode } = location.state || {};

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Email:', email);
    console.log('OTP Code:', otpCode);
  }, [location.state, email, otpCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setToastMessage({
        type: 'error',
        message: 'Mật khẩu không khớp',
      });
      return;
    }

    try {
      const requestData = {
        email: email,
        otpCode: otpCode,
        newPassword: password,
        confirmPassword: confirmPassword
      };
      console.log(requestData);

      const response = await post('auth/reset-password', requestData);

      if (response && response.message) {
        setToastMessage({
          type: 'success',
          message: 'Đổi mật khẩu thành công!',
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setToastMessage({
          type: 'error',
          message: response?.message || 'Không thể đổi mật khẩu',
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setToastMessage({
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    }
  };

  const clearToastMessage = () => {
    setToastMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faLock} className="text-indigo-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đặt lại mật khẩu
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Đổi mật khẩu
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={clearToastMessage}
        />
      )}
    </div>
  );
};

export default ResetPassword;
