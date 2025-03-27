import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../service/authService';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from '../../components/ux/toast/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { message } from 'antd';

/**
 * Login Component
 * Renders a login form allowing users to sign in to their account.
 * It handles user input for email and password, submits login credentials to the server,
 * and navigates the user to their profile upon successful authentication.
 * Displays an error message for invalid login attempts.
 */
const Login = () => {
  const navigate = useNavigate();
  const { triggerAuthCheck } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles input changes for the login form fields.
   * Updates the loginData state with the field values.
   * @param {Object} e - The event object from the input field.
   */
  const handleInputChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  /**
   * Handles the submission of the login form.
   * Attempts to authenticate the user with the provided credentials.
   * Navigates to the user profile on successful login or sets an error message on failure.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(loginData);
      if (response.error) {
        setErrorMessage(response.error);
      } else {
        // Lấy thông tin user từ response (giả sử response chứa thông tin user)
        // Nếu không có thông tin user trong response, bạn có thể cần fetch thêm
        
        // Trigger auth check (điều này sẽ load userDetails từ localStorage)
        triggerAuthCheck();
        
        // Thay đổi ở đây: Luôn chuyển hướng đến trang chủ sau khi đăng nhập thành công
        navigate('/'); // Chuyển hướng đến trang chủ
        
        // Hiển thị thông báo đăng nhập thành công
        message.success('Đăng nhập thành công!');
      }
    } catch (error) {
      setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  /**
   * Clears the current error message displayed to the user.
   */
  const dismissError = () => {
    setErrorMessage('');
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
              Đăng nhập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Đăng nhập để tiếp tục với tài khoản của bạn
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 
                             rounded-md placeholder-gray-500 text-gray-900 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 
                             focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 
                             rounded-md placeholder-gray-500 text-gray-900 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 
                             focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder="Nhập mật khẩu"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent 
                         text-sm font-medium rounded-md text-white bg-indigo-600 
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500 
                         transition-colors duration-200"
              >
                Đăng nhập
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4">
              <Toast
                type="error"
                message={errorMessage}
                dismissError={dismissError}
              />
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;