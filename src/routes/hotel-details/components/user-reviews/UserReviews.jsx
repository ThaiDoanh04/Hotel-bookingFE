import Review from './components/Review';
import React, { useState, useEffect } from 'react';
import RatingsOverview from './components/RatingsOverview';
import UserRatingsSelector from './components/UserRatingsSelector';
import { post } from '../../../../utils/request';
import Toast from '../../../../components/ux/toast/Toast';
import PaginationController from '../../../../components/ux/PaginationController';
import Loader from '../../../../components/ux/Loader';
import { AuthContext } from '../../../../contexts/AuthContext';

const UserReviews = ({
  reviewData,
  handlePageChange,
  handlePreviousPageChange,
  handleNextPageChange,
  hotelId
}) => {
  const { isAuthenticated, user } = React.useContext(AuthContext);
  
  // Khởi tạo state với giá trị mặc định 'Guest Reviewer'
  const [reviewerName, setReviewerName] = useState('Guest Reviewer');
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [stayDate, setStayDate] = useState(new Date().toISOString());
  const [verified, setVerified] = useState(true);
  const [shouldHideUserRatingsSelector, setShouldHideUserRatingsSelector] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Lấy thông tin từ localStorage khi component mount
  useEffect(() => {
    try {
      // Lấy thông tin user từ localStorage
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        
        // Kết hợp firstName và lastName (nếu cả hai tồn tại)
        if (firstName || lastName) {
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          setReviewerName(fullName || 'Guest Reviewer');
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
      // Giữ giá trị mặc định nếu có lỗi
    }
  }, []);

  // Cập nhật stayDate mỗi khi form được hiển thị
  useEffect(() => {
    setStayDate(new Date().toISOString());
  }, []);

  const handleRating = (rate) => {
    setUserRating(rate);
  };

  const handleUserReviewChange = (value) => {
    setUserReview(value);
  };

  const clearToastMessage = () => {
    setToastMessage('');
  };

  const handleReviewSubmit = async () => {
    if (userRating === 0 || !userReview) {
      setToastMessage({
        type: 'error',
        message: 'Vui lòng chọn số sao và nhập đánh giá của bạn.',
      });
      return;
    }

    try {
      const currentDateTime = new Date().toISOString();
      
      const response = await post(`api/hotels/${hotelId}/reviews`, {
        reviewerName,
        rating: userRating,
        review: userReview,
        stayDate: currentDateTime,
        verified,
      });

      if (response && (!response.errors || response.errors.length === 0)) {
        setToastMessage({
          type: 'success',
          message: 'Đánh giá của bạn đã được gửi thành công!',
        });
        
        setUserRating(0);
        setUserReview('');
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setToastMessage({
          type: 'error',
          message: 'Gửi đánh giá không thành công',
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      setToastMessage({
        type: 'error',
        message: 'Có lỗi xảy ra khi gửi đánh giá',
      });
    }
  };

  const isEmpty = !reviewData.data || reviewData.data.length === 0;

  return (
    <div className="flex flex-col p-4 border-t">
      <h1 className="text-xl font-bold text-gray-700">Đánh giá của khách hàng</h1>
      <div className="flex flex-col md:flex-row py-4 bg-white shadow-sm gap-6">
        {isEmpty ? (
          <div className="w-3/5">
            <span className="text-gray-500 italic">Hãy là người đầu tiên đánh giá!</span>
          </div>
        ) : (
          <RatingsOverview
            averageRating={reviewData.metadata?.averageRating}
            ratingsCount={reviewData.metadata?.totalReviews}
            starCounts={reviewData.metadata?.starCounts}
          />
        )}
        
        <div className={`${isEmpty ? 'md:w-full' : 'md:w-2/5'} pl-0 md:pl-4 md:border-l flex flex-col items-center justify-center`}>
          <div className="text-lg font-semibold text-gray-700 mb-2">Viết đánh giá</div>
          
          {isAuthenticated ? (
            <div className="w-full mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Người đánh giá</label>
              <div className="w-full p-2 border rounded bg-gray-100 text-gray-700">
                {reviewerName}
              </div>
            </div>
          ) : (
            <div className="w-full mb-3 p-3 bg-yellow-50 text-yellow-800 rounded">
              <p>Vui lòng đăng nhập để sử dụng tên của bạn trong đánh giá</p>
            </div>
          )}
          
          <div className="w-full mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá của bạn *</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    star <= userRating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  onClick={() => handleRating(star)}
                >
                  <path d="M10 12.585l-4.95 3.563 1.9-5.85L2.1 7.852l5.95-.435L10 2l2.95 5.417 5.95.435-4.85 3.563 1.9 5.85L10 12.585z" />
                </svg>
              ))}
            </div>
          </div>
          
          <div className="w-full mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá *</label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              value={userReview}
              onChange={(e) => handleUserReviewChange(e.target.value)}
              required
              placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
            />
          </div>
          
          <div className="w-full mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={verified}
                onChange={() => setVerified(!verified)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Tôi xác nhận đã lưu trú tại khách sạn này</span>
            </label>
          </div>
          
          <button
            className="w-full px-4 py-2 my-2 font-bold text-white rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            onClick={handleReviewSubmit}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
      
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.message}
          dismissError={clearToastMessage}
        />
      )}
      
      <div>
        {reviewData.isLoading ? (
          <Loader height={'600px'} />
        ) : (
          <div>
            {reviewData.data && reviewData.data.map((review, index) => (
              <Review
                key={review.id || index}
                reviewerName={review.reviewerName}
                reviewDate={new Date(review.stayDate).toLocaleString()}
                review={review.review}
                rating={review.rating}
                verified={review.verified}
              />
            ))}
          </div>
        )}
      </div>
      
      {reviewData.data && reviewData.data.length > 0 && reviewData.pagination && (
        <PaginationController
          currentPage={reviewData.pagination.currentPage}
          totalPages={reviewData.pagination.totalPages}
          handlePageChange={handlePageChange}
          handlePreviousPageChange={handlePreviousPageChange}
          handleNextPageChange={handleNextPageChange}
        />
      )}
    </div>
  );
};

export default UserReviews;
