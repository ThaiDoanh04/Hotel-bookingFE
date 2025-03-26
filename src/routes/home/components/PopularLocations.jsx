import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { EnvironmentOutlined, StarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * A component that displays a list of popular destinations with their respective image cards.
 * @param {Object} props - The component's props.
 * @param {Object} props.popularDestinationsData - The data for popular destinations.
 * @param {boolean} props.popularDestinationsData.isLoading - Indicates if the data is currently loading.
 * @param {Array<Object>} props.popularDestinationsData.data - The list of popular destination objects, each with the following properties:
 *    @param {number} props.popularDestinationsData.data[].code - The unique code for the destination.
 *    @param {string} props.popularDestinationsData.data[].name - The name of the destination.
 *    @param {string} props.popularDestinationsData.data[].imageUrl - The URL of the destination's image.
 * @param {Array<string>} props.popularDestinationsData.errors - Any errors that occurred while fetching the data.
 */
const PopularLocations = (props) => {
  const { popularDestinationsData } = props;
  const navigate = useNavigate();

  const onPopularDestinationCardClick = (city) => {
    // Sử dụng endpoint search với city
    navigate(`/hotels?city=${encodeURIComponent(city)}`);
  };

  // Danh sách destination mẫu (để cải thiện UI)
  const mockCityInfo = {
    'Hà Nội': { rating: 4.8, hotels: 120 },
    'Đà Nẵng': { rating: 4.9, hotels: 85 },
    'TP. Hồ Chí Minh': { rating: 4.7, hotels: 150 },
    'Nha Trang': { rating: 4.8, hotels: 95 },
    'Đà Lạt': { rating: 4.9, hotels: 78 },
  };

  // Lấy thông tin thêm cho mỗi thành phố
  const getCityInfo = (cityName) => {
    return mockCityInfo[cityName] || { rating: 4.5, hotels: 50 };
  };

  // Render skeleton khi đang tải dữ liệu
  const renderSkeletons = () => {
    return (
      <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 mt-8 max-w-full">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-none w-64">
            <Card
              className="w-full h-[240px] overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 animate-pulse"
              cover={
                <div className="h-[140px] bg-gray-200"></div>
              }
            >
              <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  // Render danh sách thành phố
  const renderDestinations = () => {
    return (
      <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 mt-8 max-w-full">
        {popularDestinationsData.data.map((city) => {
          const cityInfo = getCityInfo(city.name);
          return (
            <div key={city.code} className="flex-none w-64">
              <Card
                hoverable
                className="w-full overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                cover={
                  <div className="relative group cursor-pointer">
                    <div className="h-[140px] overflow-hidden">
                      <img
                        alt={city.name}
                        src={city.imageUrl}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center mb-1">
                        <EnvironmentOutlined className="mr-1" />
                        <span className="text-white font-medium">Việt Nam</span>
                      </div>
                      <div className="flex items-center">
                        <StarOutlined className="mr-1 text-yellow-400" />
                        <span className="text-white font-medium">{cityInfo.rating}/5</span>
                      </div>
                    </div>
                  </div>
                }
                onClick={() => onPopularDestinationCardClick(city.name)}
                bodyStyle={{ padding: '12px' }}
              >
                <Title level={5} className="mb-1 font-bold text-gray-800">{city.name}</Title>
                <div className="flex justify-between items-center">
                  <Text className="text-indigo-600 font-medium">{cityInfo.hotels}+ khách sạn</Text>
                  <Text 
                    className="text-orange-500 flex items-center text-sm cursor-pointer hover:text-orange-600"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click lan tỏa đến card
                      onPopularDestinationCardClick(city.name);
                    }}
                  >
                    Khám phá <ArrowRightOutlined className="ml-1" />
                  </Text>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  // Render khi không có dữ liệu
  const renderEmpty = () => {
    return (
      <div className="text-center my-10 p-10 bg-gray-50 rounded-lg">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" 
          alt="No destinations" 
          className="w-20 h-20 mx-auto mb-4 opacity-50"
        />
        <Text className="text-gray-500 text-lg">Không có điểm đến nào được tìm thấy.</Text>
      </div>
    );
  };

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Title 
            level={2} 
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            <span className="relative after:content-[''] after:absolute after:w-1/4 after:h-1 after:bg-indigo-500 after:bottom-[-15px] after:left-1/2 after:-translate-x-1/2">
              Điểm Đến Phổ Biến
            </span>
          </Title>
          <Text className="text-gray-600 mt-8 mb-4 block max-w-2xl mx-auto">
            Khám phá những điểm đến được yêu thích nhất và tìm kiếm khách sạn tuyệt vời cho chuyến đi sắp tới của bạn.
          </Text>
        </div>

        {popularDestinationsData?.isLoading ? (
          renderSkeletons()
        ) : popularDestinationsData?.data?.length > 0 ? (
          renderDestinations()
        ) : (
          renderEmpty()
        )}
      </div>
    </section>
  );
};

export default PopularLocations;