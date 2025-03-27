import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/FinalBookingSummary';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import { post, get } from '../../utils/request';
import Loader from '../../components/ux/Loader';
import Toast from '../../components/ux/toast/Toast';
import { format } from 'date-fns';
import { formatPrice } from '../../utils/price-helpers';
import { differenceInCalendarDays } from 'date-fns';

/**
 * Checkout component for viewing booking details and proceeding to payment.
 *
 * @returns {JSX.Element} The rendered Checkout component.
 */
const Checkout = () => {
  const { isAuthenticated, userDetails } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // For the booking summary
  const checkInDateTime = searchParams.get('checkIn') || location.state?.bookingDetails?.checkInDate || '';
  const checkOutDateTime = searchParams.get('checkOut') || location.state?.bookingDetails?.checkOutDate || '';

  const dismissToast = () => {
    setToastMessage('');
  };

  // Calculate nights
  const calculateNights = () => {
    if (!checkInDateTime || !checkOutDateTime) return 1;
    
    try {
      const startDate = new Date(checkInDateTime);
      const endDate = new Date(checkOutDateTime);
      return differenceInCalendarDays(endDate, startDate);
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 1;
    }
  };

  // Tính toán chi tiết giá cả
  const calculatePriceDetails = () => {
    const pricePerNight = location.state?.hotelDetails?.price || 0;
    const numberOfRooms = location.state?.bookingDetails?.numberOfRooms || location.state?.numberOfRooms || 1;
    const numberOfNights = calculateNights();
    
    // Giá phòng = giá mỗi đêm * số phòng * số đêm
    const roomPrice = pricePerNight * numberOfRooms * numberOfNights;
    
    // Thuế = 8% giá phòng
    const taxRate = 0.08; // 8%
    const taxAmount = roomPrice * taxRate;
    
    // Tổng tiền = giá phòng + thuế
    const totalAmount = roomPrice + taxAmount;
    
    return {
      pricePerNight,
      roomPrice,
      taxAmount,
      totalAmount,
      numberOfRooms,
      numberOfNights
    };
  };

  // Check if we have the required data
  useEffect(() => {
    const locationState = location.state;
    const checkIn = searchParams.get('checkIn') || locationState?.bookingDetails?.checkInDate;
    const checkOut = searchParams.get('checkOut') || locationState?.bookingDetails?.checkOutDate;
    
    console.log("Checkout page loaded with:", { 
      locationState, 
      checkIn, 
      checkOut, 
      searchParams: Object.fromEntries(searchParams)
    });
    
    if (!locationState) {
      console.warn("Missing required data for checkout", { locationState, checkIn, checkOut });
      const hotelCode = searchParams.get('hotelCode');
      if (hotelCode) {
        navigate(`/hotel/${hotelCode}`);
      } else {
        navigate('/');
      }
    }
  }, [location, navigate, searchParams]);

  // Hàm chuyển đến trang thanh toán
  const handleProceedToPayment = async () => {
    setIsLoading(true);
    
    try {
      const bookingId = location.state?.bookingId;
      
      if (!bookingId) {
        setToastMessage('Không tìm thấy thông tin đặt phòng. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }
      
      console.log("Redirecting to payment for bookingId:", bookingId);
      
      // Gọi API để lấy URL thanh toán
      const response = await fetch(`http://localhost:8888/api/payment/create-payment/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const paymentUrl = await response.text();
        console.log("Payment URL received:", paymentUrl);
      
        if (paymentUrl && paymentUrl.trim().startsWith("http")) {
          window.location.href = paymentUrl.trim();
        } else {
          console.error("Invalid URL format:", paymentUrl);
          setToastMessage('URL thanh toán không hợp lệ. Vui lòng thử lại.');
          setIsLoading(false);
        }
      } else {
        setToastMessage('Không thể tạo đường dẫn thanh toán. Vui lòng thử lại.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Payment redirection error:", error);
      setToastMessage('Có lỗi xảy ra khi tạo yêu cầu thanh toán. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  // Add debug logging to help troubleshoot
  useEffect(() => {
    console.log("Current location state:", location.state);
  }, [location.state]);

  // Tính số đêm
  const nights = calculateNights();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Thông tin đặt phòng</h1>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <Loader />
            <p className="mt-4 text-center">Đang chuyển đến trang thanh toán...</p>
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
              hotelName={searchParams.get('hotelName') || location.state?.hotelDetails?.title}
              checkIn={checkInDateTime}
              checkOut={checkOutDateTime}
              isAuthenticated={isAuthenticated}
              phone={userDetails?.phone || ''}
              email={userDetails?.email || ''}
              fullName={userDetails?.fullName || location.state?.bookingDetails?.guestFullName}
            />
          </div>
        </div>
        
        {/* Right column: Payment summary */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-brand">Chi tiết thanh toán</h2>
            
            {/* Thông tin thanh toán */}
            {(() => {
              const { pricePerNight, roomPrice, taxAmount, totalAmount, numberOfRooms, numberOfNights } = calculatePriceDetails();
              
              return (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span className="font-medium">
                      {location.state?.bookingDetails?.roomType || location.state?.roomType || 'Standard Room'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng phòng:</span>
                    <span className="font-medium">{numberOfRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số khách:</span>
                    <span className="font-medium">
                      {location.state?.bookingDetails?.numberOfGuests || location.state?.numberOfGuests || 2}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá mỗi đêm:</span>
                    <span className="font-medium">
                      {formatPrice(pricePerNight)} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số đêm:</span>
                    <span className="font-medium">{numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá phòng ({numberOfNights} đêm):</span>
                    <span className="font-medium">
                      {formatPrice(roomPrice)} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế & phí (8%):</span>
                    <span className="font-medium">
                      {formatPrice(taxAmount)} VND
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-bold">Tổng tiền:</span>
                    <span className="font-bold text-indigo-600">
                      {formatPrice(totalAmount)} VND
                    </span>
                  </div>
                </div>
              );
            })()}
            
            {/* Payment button */}
            <button
              onClick={handleProceedToPayment}
              disabled={isLoading}
              className={`w-full py-3 rounded-md font-medium text-white transition duration-300 ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                'Chuyển đến trang thanh toán'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;