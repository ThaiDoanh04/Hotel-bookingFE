import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { CheckCircleFilled, HomeFilled } from '@ant-design/icons';

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 p-6 text-white text-center">
          <CheckCircleFilled className="text-6xl mb-4" />
          <h1 className="text-3xl font-bold mb-3">Thanh toán thành công!</h1>
          <p className="text-lg">Đặt phòng của bạn đã được xác nhận</p>
        </div>
        
        {/* Message */}
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-6">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. 
            Email xác nhận đã được gửi đến địa chỉ email của bạn.
          </p>
          
          {/* Home button */}
          <Button 
            type="primary" 
            icon={<HomeFilled />} 
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="large"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 