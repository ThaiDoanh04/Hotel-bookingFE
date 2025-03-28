import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faCalendarTimes, 
  faHotel, 
  faUsers, 
  faMoneyBill, 
  faCheckCircle, 
  faTimesCircle,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';

const BookingPanel = ({ bookings = [] }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FontAwesomeIcon icon={faCalendarTimes} className="text-gray-400 text-5xl mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Chưa có đặt phòng nào</h3>
        <p className="text-gray-500 mb-6">Bạn chưa có lịch sử đặt phòng nào.</p>
      </div>
    );
  }

  // Helper function để lấy màu và text theo trạng thái booking
  const getStatusDetails = (status) => {
    switch(status?.toUpperCase()) {
      case 'PAID':
        return { 
          icon: faCheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-100', 
          text: 'Đã thanh toán' 
        };
      case 'PENDING':
        return { 
          icon: faSpinner, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          text: 'Chờ thanh toán' 
        };
      case 'CANCELLED':
        return { 
          icon: faTimesCircle, 
          color: 'text-red-600', 
          bgColor: 'bg-red-100',
          text: 'Đã hủy' 
        };
      case 'FAILED':
        return { 
          icon: faTimesCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Đã hủy'
        };
      default:
        return { 
          icon: faSpinner, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          text: status || 'Không xác định' 
        };
    }
  };

  // Helper function để format ngày tháng
  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Lịch sử đặt phòng</h2>
      
      <div className="space-y-6">
        {bookings.map((booking, index) => {
          const statusDetails = getStatusDetails(booking.paymentStatus || booking.status);
          
          return (
            <div key={booking.bookingId || index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header với tên khách sạn và trạng thái */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faHotel} className="text-blue-600 mr-2" />
                  <h3 className="font-medium">{booking.hotelName || 'Khách sạn'}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full ${statusDetails.bgColor} ${statusDetails.color} flex items-center`}>
                  <FontAwesomeIcon icon={statusDetails.icon} className="mr-1" />
                  <span className="text-sm font-medium">{statusDetails.text}</span>
                </div>
              </div>
              
              {/* Thông tin booking */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cột 1 */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 mr-2" />
                        <span className="text-sm">Nhận phòng:</span>
                      </div>
                      <p className="font-medium pl-6">{formatDateTime(booking.checkInDate)}</p>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faCalendarTimes} className="text-blue-600 mr-2" />
                        <span className="text-sm">Trả phòng:</span>
                      </div>
                      <p className="font-medium pl-6">{formatDateTime(booking.checkOutDate)}</p>
                    </div>
                  </div>
                  
                  {/* Cột 2 */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-600 mr-2" />
                        <span className="text-sm">Thông tin đặt phòng:</span>
                      </div>
                      <p className="font-medium pl-6">
                        {booking.numberOfRooms || 1} phòng {booking.roomType || 'Standard'}, {booking.numberOfGuests || 1} khách
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center text-gray-700 mb-1">
                        <FontAwesomeIcon icon={faMoneyBill} className="text-blue-600 mr-2" />
                        <span className="text-sm">Tổng tiền:</span>
                      </div>
                      <p className="font-medium pl-6 text-blue-700">
                        {(booking.totalAmount || booking.price || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer với mã đặt phòng - đã loại bỏ nút xem chi tiết và tiếp tục thanh toán */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-sm text-gray-600">Mã đặt phòng: </span>
                    <span className="font-mono font-bold">{booking.confirmationCode || booking.bookingId || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingPanel;