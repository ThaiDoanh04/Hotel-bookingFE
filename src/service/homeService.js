// service/homeService.js

const mockCitiesData = ['Miami', 'New York', 'Los Angeles', 'Chicago', 'San Francisco'];

const mockHotelData = [
  {
    hotelCode: '1',
    images: ['/assets/hotel.jpg'],
    title: 'Hotel Paradise',
    subtitle: 'Luxury Stay in Miami',
    location: 'Miami, FL',
    ratings: 4.7,
    price: 220,
    benefits: ['Free Wi-Fi', 'Pool', 'Spa', 'Gym'],
    description: 'A luxurious beachfront hotel with stunning views and top-notch service.',
  },
  {
    hotelCode: '2',
    images: ['/assets/hotel2.jpg'],
    title: 'City Lights Hotel',
    subtitle: 'Urban Comfort in New York',
    location: 'New York, NY',
    ratings: 4.3,
    price: 180,
    benefits: ['Rooftop Bar', 'Gym', 'Breakfast Included'],
    description: 'Located in the heart of the city, offering an elegant and modern stay.',
  },
  {
    hotelCode: '3',
    images: ['/assets/hotel3.jpg'],
    title: 'Hollywood Grand Hotel',
    subtitle: '5-Star Experience in Los Angeles',
    location: 'Los Angeles, CA',
    ratings: 4.8,
    price: 300,
    benefits: ['Infinity Pool', 'Spa', 'Luxury Suites', 'Gym'],
    description: 'Enjoy a celebrity-like stay in this stunning Hollywood luxury hotel.',
  },
  {
    hotelCode: '4',
    images: ['/assets/hotel4.jpg'],
    title: 'Skyline View Hotel',
    subtitle: 'Modern Stay in Chicago',
    location: 'Chicago, IL',
    ratings: 4.5,
    price: 210,
    benefits: ['Skyline Views', 'Heated Pool', 'Restaurant'],
    description: 'A modern hotel with a spectacular view of the Chicago skyline.',
  },
  {
    hotelCode: '5',
    images: ['/assets/hotel5.jpg'],
    title: 'Golden Gate Suites',
    subtitle: 'Bay Area Luxury in San Francisco',
    location: 'San Francisco, CA',
    ratings: 4.6,
    price: 250,
    benefits: ['Sea View', 'Bike Rental', 'Free Breakfast'],
    description: 'Located near the Golden Gate Bridge, offering premium services and comfort.',
  },
];

// Giả lập API lấy danh sách thành phố
export const fetchAvailableCities = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCitiesData);
    }, 500); // Giả lập delay 0.5s
  });
};

// Giả lập API lấy danh sách khách sạn theo thành phố
export const fetchPopularHotels = async ({ city }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredHotels = mockHotelData.filter((hotel) => hotel.location.includes(city));
      resolve(filteredHotels);
    }, 1000); // Giả lập delay 1s
  });
};

// Giả lập API lấy chi tiết khách sạn theo ID
export const fetchHotelDetails = async (hotelId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundHotel = mockHotelData.find((hotel) => hotel.hotelCode === hotelId);
      resolve(foundHotel || null);
    }, 1000); // Giả lập delay 1s
  });
};
