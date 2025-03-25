import { faStar, faCheck, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/price-helpers';

/**
 * HotelViewCard Component
 * Renders a card view for a hotel, displaying its image, title, subtitle, benefits, price, and ratings.
 * Provides a 'Book now' button to navigate to the hotel's detailed view.
 *
 * @param {Object} props - Props for the component.
 * @param {string} props.id - The unique code of the hotel.
 * @param {Object} props.image - The image object for the hotel, containing the URL and alt text.
 * @param {string} props.title - The title of the hotel.
 * @param {string} props.subtitle - The subtitle or a short description of the hotel.
 * @param {Array} props.benefits - A list of benefits or features offered by the hotel.
 * @param {string} props.price - The price information for the hotel.
 * @param {number} props.ratings - The ratings of the hotel.
 */
const HotelViewCard = (props) => {
  const {
    id: hotelId,
    image,
    title,
    subtitle,
    benefits,
    price,
    ratings,
  } = props;
  const navigate = useNavigate();
  const onBookNowClick = () => {
    navigate(`/hotel/${hotelId}`);
  };

  return (
    <div
      className="card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col md:flex-row gap-4 w-full mb-4"
      data-testid="hotel-view-card"
    >
      {/* Phần ảnh khách sạn */}
      <div className="md:w-[250px] flex-shrink-0 overflow-hidden rounded-lg">
        <Link
          to={`/hotel/${hotelId}`}
          className="block overflow-hidden rounded-lg"
        >
          <img
            src={image}
            alt={title}
            className="w-full h-[180px] md:h-[200px] object-cover hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Phần thông tin khách sạn */}
      <div className="flex flex-col justify-between flex-1">
        <div className="space-y-2">
          <Link
            to={`/hotel/${hotelId}`}
            className="block text-slate-800 hover:text-indigo-600 transition-colors duration-300"
          >
            <h4 className="text-xl md:text-2xl font-bold">{title}</h4>
          </Link>
          
          <p className="text-gray-500 text-sm flex items-center">
            <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-gray-400" /> 
            {subtitle}
          </p>
          
          {/* Benefits */}
          <div className="mt-4">
            {benefits?.length > 0 && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {benefits.map((benefit, index) => (
                  <li 
                    className="text-gray-700 text-sm flex items-start" 
                    key={index}
                  >
                    <FontAwesomeIcon 
                      icon={faCheck} 
                      className="text-green-500 mt-1 mr-2" 
                    /> 
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Phần giá và nút đặt phòng */}
      <div className="flex flex-col md:w-[180px] md:border-l border-gray-200 md:pl-4 flex-shrink-0">
        <div className="flex flex-col h-full justify-between">
          {/* Đánh giá */}
          <div className="flex md:flex-col items-center md:items-end gap-2">
            <div className="flex items-center">
              <span className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-sm flex items-center">
                {ratings} <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-300" />
              </span>
            </div>
            
            {/* Giá */}
            <div className="ml-auto md:ml-0 md:mt-4 text-right">
              <p className="font-bold text-lg md:text-xl text-indigo-600">
                {formatPrice(price)} VND
              </p>
              <p className="text-xs text-gray-500">Giá mỗi đêm</p>
            </div>
          </div>

          {/* Nút đặt phòng */}
          <button
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-4 py-3 text-white rounded-md font-medium transition-colors duration-300 w-full"
            onClick={onBookNowClick}
          >
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelViewCard;