import React from 'react';

const HotelViewCardSkeleton = () => {
  return (
    <div
      className="card border rounded-lg bg-white p-4 flex flex-col md:flex-row gap-x-4 w-full animate-pulse shadow-sm hover:shadow-md transition-shadow"
      data-testid="hotel-view-card-skeleton"
    >
      {/* Phần ảnh khách sạn */}
      <div className="md:w-[250px] h-[180px] md:h-[200px] rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
        <div className="w-full h-full bg-gray-200 rounded-lg"></div>
      </div>

      {/* Phần thông tin khách sạn */}
      <div className="flex flex-col justify-between mt-4 md:mt-0 ml-0 md:ml-2 flex-1">
        <div className="space-y-3">
          {/* Tiêu đề */}
          <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
          
          {/* Địa chỉ */}
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
          
          {/* Benefits */}
          <div className="space-y-2 mt-3">
            <div className="h-3 bg-gray-200 rounded-full w-full max-w-md"></div>
            <div className="h-3 bg-gray-200 rounded-full w-5/6 max-w-md"></div>
            <div className="h-3 bg-gray-200 rounded-full w-4/5 max-w-md"></div>
          </div>

          {/* Ratings */}
          <div className="flex items-center mt-2 space-x-2">
            <div className="h-6 w-10 bg-blue-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Phần giá và nút đặt phòng */}
      <div className="flex flex-col mt-4 md:mt-0 md:w-[180px] md:border-l border-gray-200 md:pl-4 flex-shrink-0">
        <div className="flex flex-col h-full justify-between">
          {/* Giá */}
          <div className="space-y-2 text-right">
            <div className="h-6 bg-gray-200 rounded-md w-28 ml-auto"></div>
            <div className="h-3 bg-gray-200 rounded-md w-20 ml-auto"></div>
          </div>

          {/* Nút đặt phòng */}
          <div className="mt-auto pt-4">
            <div className="h-10 bg-yellow-200 rounded-md w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelViewCardSkeleton;