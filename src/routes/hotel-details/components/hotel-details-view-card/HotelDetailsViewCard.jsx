import HotelBookingDetailsCard from '../hotel-booking-details-card/HotelBookingDetailsCard';
import UserReviews from '../user-reviews/UserReviews';
import { get } from '../../../../utils/request';
import React, { useEffect, useState } from 'react';
import ReactImageGallery from 'react-image-gallery';
import { formatPrice } from '../../../../utils/price-helpers';

const HotelDetailsViewCard = ({ hotelDetails }) => {
  console.log("HotelDetailsViewCard - hotelDetails:", hotelDetails);

  const images = hotelDetails?.images?.map((image) => ({
    original: image,
    thumbnail: image,
    thumbnailClass: 'h-[80px]',
    thumbnailLoading: 'lazy',
  })) || []; 
  const [reviewData, setReviewData] = useState({
    isLoading: true,
    data: [],
  });
  const [currentReviewsPage, setCurrentReviewPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentReviewPage(page);
  };

  const handlePreviousPageChange = () => {
    setCurrentReviewPage((prev) => {
      if (prev <= 1) return prev;
      return prev - 1;
    });
  };

  const handleNextPageChange = () => {
    setCurrentReviewPage((prev) => {
      if (prev >= reviewData.pagination.totalPages) return prev;
      return prev + 1;
    });
  };

  useEffect(() => {
    setReviewData({
      isLoading: true,
      data: [],
    });
    const fetchHotelReviews = async () => {
      const response = await get(
        `api/hotels/${hotelDetails?.hotelId}/reviews?currentPage=${currentReviewsPage}`
      );
      console.log(response);
      if (response) {
        // Tính toán metadata từ dữ liệu reviews
        const totalRatings = response.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = response.length > 0 ? (totalRatings / response.length).toFixed(1) : 0;
        
        // Tạo starCounts
        const initialCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const starCounts = response.reduce((acc, review) => {
          const ratingKey = review.rating.toString();
          if (acc.hasOwnProperty(ratingKey)) {
            acc[ratingKey]++;
          }
          return acc;
        }, initialCounts);

        // Tạo metadata và pagination
        const metadata = {
          totalReviews: response.length,
          averageRating,
          starCounts,
        };

        // Giả lập pagination nếu backend không cung cấp
        const pagination = {
          currentPage: currentReviewsPage,
          totalPages: Math.ceil(response.length / 5),
          pageSize: 5
        };
        
        setReviewData({
          isLoading: false,
          data: response,
          metadata: metadata,
          pagination: pagination
        });
      }
    };
    fetchHotelReviews();
  }, [hotelDetails?.hotelId, currentReviewsPage]);

  return (
    <div className="flex items-start justify-center flex-wrap md:flex-nowrap container mx-auto p-4">
      <div className="w-[800px] bg-white shadow-lg rounded-lg overflow-hidden">
        <div>
          <div className="relative w-full">
            <ReactImageGallery
              items={images}
              showPlayButton={false}
              showFullscreenButton={false}
            />
            {hotelDetails?.discount && (
              <div className="absolute top-0 right-0 m-4 px-2 py-1 bg-yellow-500 text-white font-semibold text-xs rounded">
                {hotelDetails.discount} OFF
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              {hotelDetails?.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {hotelDetails?.subtitle}
            </p>
            <div className="mt-2 space-y-2">
              {/* {hotelDetails?.description.map((line, index) => (
                <p key={index} className="text-gray-700">
                  {line}
                </p>
              ))} */}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-gray-600">
                {hotelDetails?.benefits?.join(' | ') || 'Amenities information not available'}
                </p>
              </div>
              <div className="text-xl font-bold text-red-500">
                {hotelDetails?.price ? `${formatPrice(hotelDetails.price)} VND` : ''} <span className="text-sm font-normal">/ night</span>
              </div>
            </div>
          </div>
        </div>
        <UserReviews
          reviewData={reviewData}
          handlePageChange={handlePageChange}
          handlePreviousPageChange={handlePreviousPageChange}
          handleNextPageChange={handleNextPageChange}
          hotelId={hotelDetails?.hotelId} 
        />
      </div>
      <HotelBookingDetailsCard hotelCode={hotelDetails?.hotelId} />
    </div>
  );
};

export default HotelDetailsViewCard;