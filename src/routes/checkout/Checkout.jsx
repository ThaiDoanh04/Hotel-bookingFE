import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/FinalBookingSummary';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getReadableMonthFormat } from '../../utils/date-helpers';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import { post } from '../../utils/request';
import Loader from '../../components/ux/Loader';
import Toast from '../../components/ux/toast/Toast';
import { format } from 'date-fns';

/**
 * Checkout component for processing payments and collecting user information.
 *
 * @returns {JSX.Element} The rendered Checkout component.
 */
const Checkout = () => {
  const { isAuthenticated, userDetails } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form data for payment
  const [formData, setFormData] = useState({
    email: userDetails?.email || '',
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [paymentConfirmationDetails, setPaymentConfirmationDetails] = useState({
    isLoading: false,
    data: {},
  });

  // For the booking summary
  const checkInDateTime = searchParams.get('checkIn') || '';
  const checkOutDateTime = searchParams.get('checkOut') || '';

  const dismissToast = () => {
    setToastMessage('');
  };

  // Check if we have the required data
  useEffect(() => {
    const locationState = location.state;
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    
    console.log("Checkout page loaded with:", { 
      locationState, 
      checkIn, 
      checkOut, 
      searchParams: Object.fromEntries(searchParams)
    });
    
    if (!locationState || !checkIn || !checkOut) {
      console.warn("Missing required data for checkout", { locationState, checkIn, checkOut });
      const hotelCode = searchParams.get('hotelCode');
      if (hotelCode) {
        navigate(`/hotel/${hotelCode}`);
      } else {
        navigate('/');
      }
    }
  }, [location, navigate, searchParams]);

  // Validation schema for form fields
  const validationSchema = {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    nameOnCard: (value) => value.trim().length > 0,
    cardNumber: (value) => /^\d{16}$/.test(value.replace(/\s/g, '')),
    expiry: (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value),
    cvc: (value) => /^\d{3,4}$/.test(value),
    address: (value) => value.trim().length > 0,
    city: (value) => value.trim().length > 0,
    state: (value) => value.trim().length > 0,
    postalCode: (value) => /^\d{5,6}$/.test(value),
  };

  /**
   * Handle form input changes and validate the input.
   * @param {React.ChangeEvent<HTMLInputElement>} e The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = validationSchema[name](value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !isValid });
  };

  /**
   * Handle form submission and validate the form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const isFieldValid = validationSchema[field](formData[field]);
      newErrors[field] = !isFieldValid;
      isValid = isValid && isFieldValid;
    });

    setErrors(newErrors);

    if (!isValid) {
      return; // Stop form submission if there are errors
    }

    setIsSubmitDisabled(true);
    setPaymentConfirmationDetails({
      isLoading: true,
      data: {},
    });
    
    try {
      // Get booking data from location state
      const bookingData = location.state?.bookingDetails;
      
      // Create payment data object
      const paymentData = {
        ...formData,
        bookingId: location.state?.bookingId,
        amount: location.state?.totalPrice,
        currency: 'VND'
      };
      
      console.log("Submitting payment:", paymentData);
      
      const response = await post('/api/payments/confirmation', paymentData);
      
      if (response && response.success) {
        setPaymentConfirmationDetails({
          isLoading: false,
          data: response.data,
        });
        
        const hotelName = searchParams.get('hotelName').replaceAll('-', '_');
        navigate(`/booking-confirmation?payment=success&hotel=${hotelName}`, {
          state: {
            confirmationData: response.data,
            bookingDetails: location.state?.bookingDetails,
            hotelDetails: location.state?.hotelDetails
          },
        });
      } else {
        setToastMessage('Thanh toán thất bại. Vui lòng thử lại.');
        setIsSubmitDisabled(false);
        setPaymentConfirmationDetails({
          isLoading: false,
          data: {},
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setToastMessage('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
      setIsSubmitDisabled(false);
      setPaymentConfirmationDetails({
        isLoading: false,
        data: {},
      });
    }
  };

  // Add debug logging to help troubleshoot
  useEffect(() => {
    console.log("Current location state:", location.state);
  }, [location.state]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Xác nhận đặt phòng và thanh toán</h1>
      
      {/* Display payment processing state */}
      {paymentConfirmationDetails.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <Loader />
            <p className="mt-4 text-center">Đang xử lý thanh toán...</p>
          </div>
        </div>
      )}
      
      {/* Toast message */}
      {toastMessage && (
        <Toast type="error" message={toastMessage} dismissToast={dismissToast} />
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column: Booking summary */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-brand">Chi tiết đặt phòng</h2>
            <FinalBookingSummary 
              hotelName={searchParams.get('hotelName')}
              checkIn={checkInDateTime}
              checkOut={checkOutDateTime}
              isAuthenticated={isAuthenticated}
              phone={userDetails?.phone || ''}
              email={userDetails?.email || formData.email}
              fullName={userDetails?.fullName || location.state?.bookingDetails?.guestFullName}
            />
            
            {/* Display booking details from state */}
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Loại phòng:</span>
                <span className="font-medium">{location.state?.roomType}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Số lượng phòng:</span>
                <span className="font-medium">{location.state?.numberOfRooms}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Số khách:</span>
                <span className="font-medium">{location.state?.numberOfGuests}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tổng tiền:</span>
                <span className="font-bold text-brand">{location.state?.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế:</span>
                <span className="font-medium">{location.state?.tax}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Payment form */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-brand">Thông tin thanh toán</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng nhập email hợp lệ</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="nameOnCard" className="block mb-1 font-medium">
                  Tên trên thẻ
                </label>
                <input
                  type="text"
                  id="nameOnCard"
                  name="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.nameOnCard ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Họ tên chủ thẻ"
                  required
                />
                {errors.nameOnCard && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng nhập tên trên thẻ</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block mb-1 font-medium">
                  Số thẻ
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng nhập số thẻ hợp lệ (16 chữ số)</p>
                )}
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label htmlFor="expiry" className="block mb-1 font-medium">
                    Ngày hết hạn
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  {errors.expiry && (
                    <p className="text-red-500 text-sm mt-1">Định dạng MM/YY</p>
                  )}
                </div>
                
                <div className="w-1/2">
                  <label htmlFor="cvc" className="block mb-1 font-medium">
                    CVC
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  {errors.cvc && (
                    <p className="text-red-500 text-sm mt-1">3-4 chữ số</p>
                  )}
                </div>
              </div>
              
              <h3 className="font-semibold mt-6 mb-3">Địa chỉ thanh toán</h3>
              
              <div className="mb-4">
                <label htmlFor="address" className="block mb-1 font-medium">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="123 Đường ABC"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng nhập địa chỉ</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="city" className="block mb-1 font-medium">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Thành phố"
                    required
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">Vui lòng nhập thành phố</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="state" className="block mb-1 font-medium">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tỉnh/TP"
                    required
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">Vui lòng nhập tỉnh/thành phố</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="postalCode" className="block mb-1 font-medium">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="12345"
                  required
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-sm mt-1">Mã bưu điện không hợp lệ</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-3 px-4 rounded-md font-medium text-white 
                  ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'}`}
              >
                {isSubmitDisabled ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generic Input field component for collecting user information.
 * @param {Object} props The component props.
 * @param {string} props.label The input field label.
 * @param {string} props.type The input field type.
 * @param {string} props.name The input field name.
 * @param {string} props.value The input field value.
 * @param {Function} props.onChange The input field change handler.
 * @param {string} props.placeholder The input field placeholder.
 * @param {boolean} props.required The input field required status.
 * @param {boolean} props.error The input field error status.
 *
 * @returns {JSX.Element} The rendered InputField component.
 */
const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      className={`shadow appearance-none border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
    />
    {error && (
      <p className="text-red-500 text-xs my-1">Please check this field.</p>
    )}
  </div>
);

export default Checkout;
