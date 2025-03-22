import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders the ratings overview component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.averageRating - The average rating.
 * @param {number} props.ratingsCount - The total count of ratings.
 * @param {Object} props.starCounts - The count of each star rating.
 * @returns {JSX.Element} The rendered component.
 */
const RatingsOverview = ({ averageRating = 0, ratingsCount = 0, starCounts = {} }) => {
  // Đảm bảo starCounts không phải null/undefined
  const counts = starCounts || {};
  
  return (
    <div className="w-full md:w-3/5 p-4 bg-white rounded-lg shadow-sm">
      <div className="text-lg font-semibold text-gray-700">Đánh giá tổng quan</div>
      <div className="flex items-center mt-2">
        <div className="text-3xl font-bold text-gray-700">{averageRating || 0}</div>
        <div className="text-3xl font-bold text-gray-500">/5</div>
        <div className="ml-2 flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={fasStar}
              className={`${
                star <= Math.round(averageRating || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="text-sm mb-4">Dựa trên {ratingsCount || 0} đánh giá</div>
      
      {Object.keys(counts).length > 0 ? (
        Object.keys(counts)
          .sort((a, b) => b - a)
          .map((starRating) => (
            <div className="flex items-center my-1.5 gap-x-4" key={starRating}>
              <div className="w-10 pr-2 flex items-center text-sm">
                {starRating}{' '}
                <FontAwesomeIcon
                  icon={fasStar}
                  className="text-yellow-400 ml-1"
                  size="sm"
                />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(counts[starRating] / (ratingsCount || 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm w-8 text-right font-medium">
                {counts[starRating]}
              </span>
            </div>
          ))
      ) : (
        <div className="text-sm text-gray-500 py-2">
          Chưa có đủ dữ liệu đánh giá
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 border-t pt-3">
        <p>Xếp hạng dựa trên trải nghiệm của khách hàng</p>
      </div>
    </div>
  );
};

export default RatingsOverview;