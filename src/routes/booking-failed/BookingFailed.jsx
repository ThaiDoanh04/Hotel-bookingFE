import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { CloseCircleFilled, HomeFilled } from '@ant-design/icons';

const BookingFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 p-6 text-white text-center">
          <CloseCircleFilled className="text-6xl mb-4" />
          <h1 className="text-3xl font-bold mb-3">Thanh toán thất bại</h1>
          <p className="text-lg">Rất tiếc, thanh toán của bạn không thành công</p>
        </div>
        
        {/* Message */}
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-6">
            Vui lòng thử lại sau hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.
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

export default BookingFailed;