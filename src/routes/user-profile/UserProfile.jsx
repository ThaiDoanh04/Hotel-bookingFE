import React, { useState, useEffect, useRef } from 'react';
import Tabs from '../../components/ux/tabs/Tabs';
import TabPanel from '../../components/ux/tab-panel/TabPanel';
import {
  faAddressCard,
  faHotel,
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { get } from '../../utils/request';
import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import useOutsideClickHandler from '../../hooks/useOutsideClickHandler';
import { useNavigate } from 'react-router-dom';
import BookingPanel from './components/BookingPanel';
import ProfileDetailsPanel from './components/ProfileDetailsPanel';

/**
 * UserProfile
 * Renders the user profile page with tabs for personal details and bookings.
 * @returns {JSX.Element} - The UserProfile component
 * */
const UserProfile = () => {
  const { userDetails } = useContext(AuthContext);
  const navigate = useNavigate();

  const wrapperRef = useRef();
  const buttonRef = useRef();

  const [isTabsVisible, setIsTabsVisible] = useState(false);

  // Fetch user bookings data
  const [userBookingsData, setUserBookingsData] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });

  useOutsideClickHandler(wrapperRef, (event) => {
    if (!buttonRef.current.contains(event.target)) {
      setIsTabsVisible(false);
    }
  });

  const onTabsMenuButtonAction = () => {
    setIsTabsVisible(!isTabsVisible);
  };

  // effect to set initial state of user bookings data
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setUserBookingsData({
          isLoading: true,
          data: [],
          errors: []
        });
        
        // Lấy userId từ userDetails
        const userId = userDetails?.userId;
        
        if (!userId) {
          throw new Error('User ID không có sẵn');
        }
        
        // Gọi API với userId cụ thể
        const userBookingsResponse = await get(`api/bookings/user/${userId}`);
        
        if (userBookingsResponse) {
          setUserBookingsData({
            isLoading: false,
            data: Array.isArray(userBookingsResponse) ? userBookingsResponse : [],
            errors: []
          });
        } else {
          throw new Error('Không nhận được phản hồi từ API');
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        setUserBookingsData({
          isLoading: false,
          data: [],
          errors: [error.message || 'Không thể tải dữ liệu đặt phòng']
        });
      }
    };
    
    if (userDetails) {
      fetchUserBookings();
    }
  }, [userDetails]);

  return (
    <>
      <div className="container mx-auto p-4 my-10 min-h-[530px]">
        <div className="mx-4">
          <button
            ref={buttonRef}
            onClick={onTabsMenuButtonAction}
            className="block md:hidden items-center px-4 py-1.5 border border-gray-300 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FontAwesomeIcon
              icon={isTabsVisible ? faXmark : faBars}
              size="lg"
            />
          </button>
        </div>
        <Tabs isTabsVisible={isTabsVisible} wrapperRef={wrapperRef}>
          <TabPanel label="Personal Details" icon={faAddressCard}>
            <ProfileDetailsPanel userDetails={userDetails} />
          </TabPanel>
          <TabPanel label="Bookings" icon={faHotel}>
            <BookingPanel bookings={userBookingsData.data} />
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
};

export default UserProfile;