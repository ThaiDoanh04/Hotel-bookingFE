import React, { useState, useEffect } from 'react';
import Toast from '../../../components/ux/toast/Toast';
import { get, post } from '../../../utils/request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faPen, 
  faCheck, 
  faTimes, 
  faGlobe, 
  faBirthdayCake
} from '@fortawesome/free-solid-svg-icons';

/**
 * Renders the user profile details panel.
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.userDetails - The user's details.
 * @returns {JSX.Element} The rendered component.
 * */
const ProfileDetailsPanel = ({ userDetails }) => {
  // states to manage the edit mode and user details
  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [nationality, setNationality] = useState('');
  const [countries, setCountries] = useState([]);

  const [toastMessage, setToastMessage] = useState('');

  // Thêm state cho phần password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const clearToastMessage = () => {
    setToastMessage('');
  };

  const handleEditClick = () => {
    setIsEditMode(!isEditMode);
  };

  const handleCancelClick = () => {
    setIsEditMode(!isEditMode);
  };

  /**
   * Handles the save button click event.
   * Updates the user details and sets the edit mode to false.
   * */
  const handleSaveClick = async () => {
    try {
      // Kiểm tra và cập nhật thông tin cá nhân
      const hasProfileChanges = 
        firstName !== userDetails.firstName ||
        lastName !== userDetails.lastName ||
        phoneNumber !== userDetails.phone ||
        nationality !== userDetails.country;

      // Kiểm tra nếu có thay đổi mật khẩu
      const hasPasswordChanges = showPasswordSection && 
        passwordData.currentPassword && 
        passwordData.newPassword && 
        passwordData.confirmPassword;

      if (!hasProfileChanges && !hasPasswordChanges) {
        setIsEditMode(false);
        return;
      }

      // Validate mật khẩu nếu có thay đổi
      if (hasPasswordChanges) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setToastMessage({
            type: 'error',
            message: 'Mật khẩu mới không khớp'
          });
          return;
        }
      }

      // Cập nhật thông tin cá nhân nếu có thay đổi
      if (hasProfileChanges) {
        const profileResponse = await post('auth/update-profile', {
          firstName,
          lastName,
          phoneNumber,
          country: nationality,
        });

        if (!profileResponse.message) {
          throw new Error('Không thể cập nhật thông tin cá nhân');
        }

        // Cập nhật localStorage
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const updatedUserInfo = {
          ...userInfo,
          firstName,
          lastName,
          phoneNumber,
          country: nationality
        };
        localStorage.setItem('user', JSON.stringify(updatedUserInfo));
      }

      // Cập nhật mật khẩu nếu có thay đổi
      if (hasPasswordChanges) {
        const passwordResponse = await post('auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!passwordResponse.message) {
          throw new Error('Không thể cập nhật mật khẩu');
        }
      }

      // Nếu tất cả thành công
      setToastMessage({
        type: 'success',
        message: 'Cập nhật thông tin thành công'
      });

      // Reset form
      setIsEditMode(false);
      setShowPasswordSection(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      // Xử lý lỗi
      setToastMessage({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      });

      // Revert changes if error
      setFirstName(userDetails.firstName);
      setLastName(userDetails.lastName);
      setPhoneNumber(userDetails.phone);
      setNationality(userDetails.country);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // effect to set initial state of user details
  useEffect(() => {
    try {
      // Lấy thông tin từ localStorage
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('User data from localStorage:', userData); // Debug để xem dữ liệu
        
        // Cập nhật state với dữ liệu từ localStorage
        setFirstName(userData.firstName || '');
        setLastName(userData.lastName || '');
        setEmail(userData.email || '');
        setPhoneNumber(userData.phoneNumber || ''); // Lấy phone từ localStorage
        setNationality(userData.country || '');
        setIsEmailVerified(userData.isEmailVerified || false);
        setIsPhoneVerified(userData.isPhoneVerified || false);
        setDateOfBirth(userData.dateOfBirth || '');
      }
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
      // Sử dụng dữ liệu từ userDetails nếu có lỗi
      if (userDetails) {
        setFirstName(userDetails.firstName || '');
        setLastName(userDetails.lastName || '');
        setEmail(userDetails.email || '');
        setPhoneNumber(userDetails.phone || '');
        setNationality(userDetails.country || '');
        setIsEmailVerified(userDetails.isEmailVerified || false);
        setIsPhoneVerified(userDetails.isPhoneVerified || false);
        setDateOfBirth(userDetails.dateOfBirth || '');
      }
    }
  }, [userDetails]);

  useEffect(() => {
    const fetchCountries = async () => {
      const countriesData = await get('/api/misc/countries');
      if (countriesData && countriesData.data) {
        console.log('countriesData', countriesData.data);
        const mappedValues = countriesData.data.elements.map((country) => ({
          label: country.name,
          value: country.name,
        }));
        setCountries(mappedValues);
      }
    };
    fetchCountries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 text-center border-b border-gray-200">
          <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Thông tin cá nhân
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Cập nhật thông tin của bạn để đảm bảo tài khoản luôn được bảo mật
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="space-y-6">
            {isEditMode ? (
              // Edit Mode Fields
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={faUser}
                  label="Họ"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <InputField
                  icon={faUser}
                  label="Tên"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <InputField
                  icon={faEnvelope}
                  label="Email"
                  value={email}
                  disabled
                  verified={isEmailVerified}
                />
                <InputField
                  icon={faPhone}
                  label="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  verified={isPhoneVerified}
                />
                <InputField
                  icon={faBirthdayCake}
                  label="Ngày sinh"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <InputField
                  icon={faGlobe}
                  label="Quốc tịch"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  isSelect
                  options={countries}
                />
              </div>
            ) : (
              // Display Mode Fields
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisplayField icon={faUser} label="Họ" value={firstName} />
                <DisplayField icon={faUser} label="Tên" value={lastName} />
                <DisplayField 
                  icon={faEnvelope} 
                  label="Email" 
                  value={email} 
                  verified={isEmailVerified}
                />
                <DisplayField 
                  icon={faPhone} 
                  label="Số điện thoại" 
                  value={phoneNumber || 'Chưa cập nhật'} 
                  verified={isPhoneVerified}
                />
                <DisplayField 
                  icon={faBirthdayCake} 
                  label="Ngày sinh" 
                  value={dateOfBirth || 'Chưa cập nhật'} 
                />
                <DisplayField 
                  icon={faGlobe} 
                  label="Quốc tịch" 
                  value={nationality || 'Chưa cập nhật'} 
                />
              </div>
            )}

            {/* Password Change Section */}
            {isEditMode && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Đổi mật khẩu
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                  >
                    {showPasswordSection ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-4">
                    <PasswordField
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      showPassword={showPasswords.current}
                      toggleVisibility={() => togglePasswordVisibility('current')}
                    />
                    <PasswordField
                      label="Mật khẩu mới"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      showPassword={showPasswords.new}
                      toggleVisibility={() => togglePasswordVisibility('new')}
                    />
                    <PasswordField
                      label="Xác nhận mật khẩu mới"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      showPassword={showPasswords.confirm}
                      toggleVisibility={() => togglePasswordVisibility('confirm')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancelClick}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium 
                           text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-6 py-3 border border-transparent rounded-md text-sm font-medium 
                           text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <button
                onClick={handleEditClick}
                className="px-6 py-3 border border-transparent rounded-md text-sm font-medium 
                         text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FontAwesomeIcon icon={faPen} className="mr-2" />
                Chỉnh sửa
              </button>
            )}
          </div>
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

// Display Field Component
const DisplayField = ({ icon, label, value, verified }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center text-sm text-gray-500 mb-1">
      <FontAwesomeIcon icon={icon} className="mr-2" />
      {label}
    </div>
    <div className="flex items-center justify-between">
      <div className="text-gray-900">{value}</div>
      {verified && (
        <span className="text-green-500 text-sm font-medium">Đã xác thực</span>
      )}
    </div>
  </div>
);

// Input Field Component
const InputField = ({ icon, label, value, onChange, disabled, verified, type = "text", isSelect, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={icon} className="text-gray-400" />
      </div>
      {isSelect ? (
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 
                   focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Chọn quốc tịch</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 
                   focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      )}
      {verified && (
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <span className="text-green-500 text-sm font-medium">Đã xác thực</span>
        </span>
      )}
    </div>
  </div>
);

// Password Field Component
const PasswordField = ({ label, name, value, onChange, showPassword, toggleVisibility }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
      </div>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md 
                 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <FontAwesomeIcon
          icon={showPassword ? faEyeSlash : faEye}
          className="text-gray-400 hover:text-gray-500"
        />
      </button>
    </div>
  </div>
);

export default ProfileDetailsPanel;