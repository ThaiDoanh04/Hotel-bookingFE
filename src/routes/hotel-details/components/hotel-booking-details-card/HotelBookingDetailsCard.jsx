import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { differenceInCalendarDays } from 'date-fns';
import DateRangePicker from '../../../../components/ux/toast/date-range-picker/DateRangePicker';
import { get, post } from '../../../../utils/request';
import { DEFAULT_TAX_DETAILS } from '../../../../utils/constants';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { formatPrice } from '../../../../utils/price-helpers';
import Toast from '../../../../components/ux/toast/Toast';
import format from 'date-fns/format';

/**
 * A component that displays the booking details for a hotel, including date range, room type, and pricing.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.hotelCode - The unique code for the hotel.
 */
const HotelBookingDetailsCard = ({ hotelCode }) => {
  // State for date picker visibility
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);

  const navigate = useNavigate();

  // State for error message
  const [errorMessage, setErrorMessage] = useState('');

  // State for hotel details from API
  const [hotelDetails, setHotelDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for date range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection',
    },
  ]);

  // State for selected room, guests, and rooms
  const [selectedRoom, setSelectedRoom] = useState({
    value: 'Standard Room',
    label: 'Standard Room',
  });
  const [selectedGuests, setSelectedGuests] = useState({
    value: 2,
    label: '2 guests',
  });
  const [selectedRooms, setSelectedRooms] = useState({
    value: 1,
    label: '1 room',
  });

  // State for pricing and booking details
  const [total, setTotal] = useState('0 VND');
  const [taxes, setTaxes] = useState('0 VND');
  const [bookingPeriodDays, setBookingPeriodDays] = useState(1);

  // Default options
  const guestOptions = Array.from(
    { length: 10 },
    (_, i) => ({ value: i + 1, label: `${i + 1} guests` })
  );
  
  const roomNumberOptions = Array.from(
    { length: 5 },
    (_, i) => ({ value: i + 1, label: `${i + 1} room${i > 0 ? 's' : ''}` })
  );
  
  const roomOptions = [
    { value: 'Standard Room', label: 'Standard Room' },
    { value: 'Deluxe Room', label: 'Deluxe Room' },
    { value: 'Suite', label: 'Suite' },
  ];

  // Thêm state cho guestFullName
  const [guestFullName, setGuestFullName] = useState('');

  // Handlers for select changes
  const handleRoomTypeChange = (selectedOption) => {
    setSelectedRoom(selectedOption);
    calculatePrices();
  };
  
  const handleGuestsNumberChange = (selectedOption) => {
    setSelectedGuests(selectedOption);
  };
  
  const handleRoomsNumberChange = (selectedOption) => {
    setSelectedRooms(selectedOption);
    calculatePrices();
  };

  // Handler for date picker visibility toggle
  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  /**
   * Handler for date range changes. Updates the booking period days and recalculates prices.
   *
   * @param {Object} ranges - The selected date ranges.
   */
  const onDateChangeHandler = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    console.log("Date range changed:", { startDate, endDate });
    
    setDateRange([ranges.selection]);
    const days =
      startDate && endDate
        ? differenceInCalendarDays(endDate, startDate)
        : 1;
    console.log(`Booking period: ${days} days`);
    
    setBookingPeriodDays(days);
    calculatePrices();
  };

  /**
   * Calculates the total price and taxes based on the selected room and booking period.
   */
  const calculatePrices = () => {
    if (!hotelDetails) return;
    
    console.log("Calculating prices with:", {
      hotelDetails,
      pricePerNight: hotelDetails.price,
      rooms: selectedRooms.value,
      days: bookingPeriodDays
    });
    
    const pricePerNight = hotelDetails.price * selectedRooms.value;
    const gstRate = 0.08; // 8% tax rate
    const totalGst = (pricePerNight * bookingPeriodDays * gstRate).toFixed(2);
    const totalPrice = (
      pricePerNight * bookingPeriodDays +
      parseFloat(totalGst)
    ).toFixed(2);
    
    console.log("Calculated prices:", {
      pricePerNight,
      totalGst,
      totalPrice
    });
    
    if (!isNaN(totalPrice)) {
      setTotal(`${formatPrice(totalPrice)} VND`);
    }
    setTaxes(`${formatPrice(totalGst)} VND`);
  };

  /**
   * Thêm useEffect để lấy thông tin user từ localStorage
   */
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        
        // Kết hợp firstName và lastName
        if (firstName || lastName) {
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          setGuestFullName(fullName);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
    }
  }, []);

  /**
   * Xử lý xác nhận đặt phòng và tạo booking
   */
  const onBookingConfirm = async () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      setErrorMessage('Vui lòng chọn ngày check-in và check-out.');
      return;
    }
    
    if (!hotelDetails) {
      setErrorMessage('Không thể tải thông tin khách sạn.');
      return;
    }

    if (!guestFullName) {
      setErrorMessage('Không tìm thấy thông tin người đặt phòng.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Format dữ liệu theo BookingRequest
      const bookingData = {
        checkInDate: format(dateRange[0].startDate, 'yyyy-MM-dd'),
        checkOutDate: format(dateRange[0].endDate, 'yyyy-MM-dd'),
        guestFullName: guestFullName,
        numberOfGuests: selectedGuests.value,
        numberOfRooms: selectedRooms.value,
        roomType: selectedRoom.label,
        hotelId: parseInt(hotelCode),
        status: "PENDING" // Thêm trạng thái PENDING
      };
      
      console.log("Booking data:", bookingData);
      
      // Gọi API để tạo booking với trạng thái PENDING
      const response = await post('api/bookings/create', bookingData);
      
      if (response && response.error) {
        throw new Error(response.error || 'Đã xảy ra lỗi khi đặt phòng');
      }
      
      // Chuyển hướng đến trang checkout với đầy đủ thông tin cần thiết
      navigate(`/checkout?hotelCode=${hotelCode}&checkIn=${format(dateRange[0].startDate, 'yyyy-MM-dd')}&checkOut=${format(dateRange[0].endDate, 'yyyy-MM-dd')}&hotelName=${encodeURIComponent(hotelDetails.title || 'Hotel')}`, {
        state: {
          bookingId: response.bookingId, // Sử dụng ID từ response API thay vì tạo tạm thời
          bookingDetails: bookingData,
          hotelDetails: hotelDetails,
          roomType: selectedRoom.label,
          numberOfRooms: selectedRooms.value,
          numberOfGuests: selectedGuests.value,
          totalPrice: total,
          tax: taxes,
          confirmationCode: response.confirmationCode || null
        }
      });
    } catch (error) {
      console.error("Error during booking preparation:", error);
      setErrorMessage(error.message || 'Có lỗi xảy ra khi chuẩn bị đặt phòng.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for dismissing error message
  const dismissError = () => {
    setErrorMessage('');
  };

  // Effect for fetching hotel details directly from the hotels API
  useEffect(() => {
    const getHotelDetails = async () => {
      try {
        console.log(`Fetching hotel details for ID: ${hotelCode}`);
        const response = await get(`api/hotels/${hotelCode}`);
        console.log('Hotel details response:', response);
        
        if (response) {
          setHotelDetails(response);
        } else {
          throw new Error('Could not fetch hotel details');
        }
      } catch (error) {
        console.error('Error fetching hotel details:', error);
        setErrorMessage('Không thể lấy thông tin khách sạn. Vui lòng thử lại sau.');
      }
    };
    
    if (hotelCode) {
      getHotelDetails();
    }
  }, [hotelCode]);

  // Effect for calculating prices when dependencies change
  useEffect(() => {
    if (hotelDetails) {
      calculatePrices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelDetails, bookingPeriodDays, selectedRooms]);

  return (
    <div className="mx-2 bg-white shadow-xl rounded-xl overflow-hidden mt-2 md:mt-0 w-full md:w-[380px]">
      <div className="px-6 py-4 bg-brand">
        <h2 className="text-xl font-bold">Chi tiết đặt phòng</h2>
      </div>
      <div className="p-6 text-sm md:text-base">
        {/* Total Price */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            Tổng tiền
          </div>
          <div className="text-xl font-bold text-indigo-600">{total}</div>
          <div className="text-sm text-green-600">
            Miễn phí hủy phòng trước 24 giờ
          </div>
        </div>

        {/* Dates & Time */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Ngày nhận và trả phòng</div>
          <div className="text-gray-600">
            <DateRangePicker
              isDatePickerVisible={isDatePickerVisible}
              onDatePickerIconClick={onDatePickerIconClick}
              onDateChangeHandler={onDateChangeHandler}
              setisDatePickerVisible={setisDatePickerVisible}
              dateRange={dateRange}
              inputStyle="DARK"
            />
          </div>
          {bookingPeriodDays > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              Số đêm: <span className="font-bold">{bookingPeriodDays}</span>
            </div>
          )}
        </div>

        {/* Reservation */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Đặt chỗ</div>
          <Select
            value={selectedRooms}
            onChange={handleRoomsNumberChange}
            options={roomNumberOptions}
            className="mb-2"
          />
          <Select
            value={selectedGuests}
            onChange={handleGuestsNumberChange}
            options={guestOptions}
          />
        </div>

        {/* Room Type */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Loại phòng</div>
          <Select
            value={selectedRoom}
            onChange={handleRoomTypeChange}
            options={roomOptions}
          />
        </div>

        {/* Per day rate */}
        <div className="mb-4">
          <div className="font-semibold text-gray-800">Giá mỗi đêm</div>
          <div className="text-gray-600">
            {hotelDetails ? `${formatPrice(hotelDetails.price)} VND` : 'Đang tải...'}
          </div>
        </div>

        {/* Chi tiết giá */}
        {hotelDetails && (
          <div className="mb-4">
            <div className="font-semibold text-gray-800 mb-2">Chi tiết giá</div>
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Giá mỗi đêm:</span>
                <span className="text-gray-800 font-medium">{formatPrice(hotelDetails.price)} VND</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Số phòng:</span>
                <span className="text-gray-800 font-medium">{selectedRooms.value}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Số đêm:</span>
                <span className="text-gray-800 font-medium">{bookingPeriodDays}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Thuế & phí (8%):</span>
                <span className="text-gray-800 font-medium">{taxes}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-800">Tổng cộng:</span>
                <span className="text-indigo-600">{total}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {DEFAULT_TAX_DETAILS || 'Giá đã bao gồm thuế và phí dịch vụ.'}
            </div>
          </div>
        )}

        {errorMessage && (
          <Toast
            type="error"
            message={errorMessage}
            dismissError={dismissError}
          />
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <button
          onClick={onBookingConfirm}
          disabled={isProcessing || !hotelDetails}
          className={`w-full py-2 rounded transition duration-300 flex items-center justify-center
            ${isProcessing || !hotelDetails
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : !hotelDetails ? (
            'Đang tải thông tin...'
          ) : (
            'Xác nhận đặt phòng'
          )}
        </button>
      </div>
    </div>
  );
};

export default HotelBookingDetailsCard;