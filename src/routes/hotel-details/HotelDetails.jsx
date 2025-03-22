import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../../utils/request';
import HotelDetailsViewCard from './components/hotel-details-view-card/HotelDetailsViewCard';
import HotelDetailsViewCardSkeleton from './components/hotel-details-view-card-skeleton/HotelDetailsViewCardSkeleton';

/**
 * Represents the hotel details component.
 * @component
 * @returns {JSX.Element} The hotel details component.
 */
const HotelDetails = () => {
  const { hotelId } = useParams();
  const [hotelDetails, setHotelDetails] = useState({
    isLoading: true,
    data: null,
  });

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await get(`api/hotels/${hotelId}`);
        console.log('API Response:', response);
        setHotelDetails({
          isLoading: false,
          data: response,
        });
        console.log(hotelDetails);
      } catch (error) {
        console.error('Error fetching hotel details:', error);
        setHotelDetails({
          isLoading: false,
          error: 'Failed to load hotel details',
          data: null,
        });
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  if (hotelDetails.error) {
    return <div className="text-center py-10 text-red-600">{hotelDetails.error}</div>;
  }

  return (
    <>
      {hotelDetails.isLoading ? (
        <HotelDetailsViewCardSkeleton />
      ) : (
        <HotelDetailsViewCard hotelDetails={hotelDetails.data} />
      )}
    </>
  );
};

export default HotelDetails;