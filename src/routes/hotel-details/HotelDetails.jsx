import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HotelViewCard from '../../components/hotel-view-card/HotelViewCard';
import HotelViewCardSkeleton from '../../components/hotel-view-card-skeleton/HotelViewCardSkeleton';
/**
 * Represents the hotel details component.
 * @component
 * @returns {JSX.Element} The hotel details component.
 */
const HotelDetails = () => {
  const { hotelId } = useParams();
  const [hotelDetails, setHotelDetails] = useState({
    isLoading: true,
    data: {},
  });

  useEffect(() => {
    const fetchHotelDetails = async () => {
      // Giả lập dữ liệu API với độ trễ
      setTimeout(() => {
        setHotelDetails({
          isLoading: false,
          data: {
            id: hotelId,
            image:'/assets/hotel.jpg',
            name: 'Hotel Luxury',
            location: '123 Beach Street, Miami',
            rating: 4.5,
            pricePerNight: '$200',
            amenities: ['Free Wi-Fi', 'Pool', 'Gym', 'Spa'],
            description: 'A luxurious hotel with a beautiful ocean view and excellent services.',
          },
        });
      }, 1000); // Giả lập delay 1s
    };

    fetchHotelDetails();
  }, [hotelId]);

  return (
    <>
      {hotelDetails.isLoading ? (
        <HotelViewCardSkeleton />
      ) : (
        <HotelViewCard hotelDetails={hotelDetails.data} />
      )}
    </>
  );
};

export default HotelDetails;
