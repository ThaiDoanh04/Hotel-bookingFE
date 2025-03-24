import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from '../../utils/request';
import Toast from '../../components/ux/toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  // Tạo refs cho từng input
  const inputRefs = useRef([]);

  useEffect(() => {
    // if (!email) {
    //   navigate('/forgot-password');
    // }
    // Focus vào ô đầu tiên khi component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus vào ô tiếp theo nếu có giá trị
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    // Xử lý khi nhấn backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Nếu ô hiện tại trống và không phải ô đầu tiên, focus về ô trước
        inputRefs.current[index - 1].focus();
        setOtp([...otp.map((d, idx) => (idx === index - 1 ? '' : d))]);
      } else if (otp[index]) {
        // Nếu ô hiện tại có giá trị, xóa giá trị đó
        setOtp([...otp.map((d, idx) => (idx === index ? '' : d))]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setToastMessage({
        type: 'error',
        message: 'Vui lòng nhập đủ 6 số',
      });
      return;
    }

    try {
      const response = await post('auth/verify-otp', {
        email,
        otpCode: otpValue
      });

      if (response && response.message) {
        setToastMessage({
          type: 'success',
          message: 'Xác thực OTP thành công!',
        });
        
        setTimeout(() => {
          navigate('/reset-password', {
            state: { 
              email,
              otpCode: otpValue
            }
          });
        }, 1500);
      } else {
        setToastMessage({
          type: 'error',
          message: response?.message || 'Mã OTP không chính xác',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setToastMessage({
        type: 'error',
        message: 'Có lỗi xảy ra khi xác thực OTP',
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
              <FontAwesomeIcon icon={faEnvelope} className="text-indigo-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Xác thực OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng nhập mã OTP đã được gửi đến
            </p>
            <p className="mt-1 text-sm font-medium text-indigo-600">
              {email}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={el => inputRefs.current[index] = el}
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleBackspace(e, index)}
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none
                             transition-all duration-200 bg-gray-50"
                    required
                  />
                ))}
              </div>

              <div className="text-center text-sm text-gray-600 mt-4">
                Không nhận được mã? 
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none"
                >
                  Gửi lại mã
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         text-sm font-medium rounded-md text-white bg-indigo-600 
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500 
                         transition-colors duration-200"
              >
                Xác nhận
              </button>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="w-full flex items-center justify-center py-3 px-4 
                         border border-gray-300 rounded-md text-sm font-medium 
                         text-gray-700 bg-white hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-indigo-500 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Quay lại
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

export default OTPVerification;
