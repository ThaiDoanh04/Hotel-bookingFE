import HeroCover from '../../routes/home/components/HeroCover.jsx';
import PopularLocations from '../../routes/home/components/PopularLocations.jsx';
import { get } from '../../utils/request.js';
import { useState, useEffect, useCallback } from 'react';
import { MAX_GUESTS_INPUT_VALUE } from '../../utils/constants';
import ResultsContainer from '../../components/results-container/ResultsContainer.jsx';
import { formatDate } from '../../utils/date-helpers';
import { useNavigate } from 'react-router-dom';
import _debounce from 'lodash/debounce';

/**
 * Home component that renders the main page of the application.
 * It includes a navigation bar, hero cover, popular locations, results container, and footer.
 */
const Home = () => {
  const navigate = useNavigate();

  // State variables
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState('');
  const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
  const [popularDestinationsData, setPopularDestinationsData] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });
  const [hotelsResults, setHotelsResults] = useState({
    isLoading: true,
    data: [],
    errors: [],
  });

  // State for storing available cities
  const [availableCities, setAvailableCities] = useState([]);

  const [filteredTypeheadResults, setFilteredTypeheadResults] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFn = useCallback(_debounce(queryResults, 1000), []);

  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);

  const onDatePickerIconClick = () => {
    setisDatePickerVisible(!isDatePickerVisible);
  };

  const onLocationChangeInput = async (newValue) => {
    setLocationInputValue(newValue);
    // Debounce the queryResults function to avoid making too many requests
    debounceFn(newValue, availableCities);
  };

  /**
   * Queries the available cities based on the user's input.
   * @param {string} query - The user's input.
   * @returns {void}
   *
   */
  function queryResults(query, availableCities) {
    const filteredResults = availableCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTypeheadResults(filteredResults);
  }

  const onNumGuestsInputChange = (numGuests) => {
    if (
      (numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) ||
      numGuests === ''
    ) {
      setNumGuestsInputValue(numGuests);
    }
  };

  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };

  /**
   * Handles the click event of the search button.
   * It gathers the number of guests, check-in and check-out dates, and selected city
   * from the component's state, and then navigates to the '/hotels' route with this data.
   */
  const onSearchButtonAction = () => {
    const numGuest = Number(numGuestsInputValue);
    const checkInDate = formatDate(dateRange[0].startDate) ?? '';
    const checkOutDate = formatDate(dateRange[0].endDate) ?? '';
    const city = locationInputValue;
    
    // Tạo query params thay vì dùng state
    const params = new URLSearchParams();
    
    // Thêm các tham số vào URL
    if (city) {
      params.append('city', city);
    }
    
    if (numGuest > 0) {
      params.append('numOfGuests', numGuest);
    }
    
    if (checkInDate) {
      params.append('checkInDate', checkInDate);
    }
    
    if (checkOutDate) {
      params.append('checkOutDate', checkOutDate);
    }
    
    // Chuyển hướng đến trang hotels với query params
    // Nếu không có tham số nào, chỉ chuyển đến /hotels
    if (params.toString()) {
      navigate(`/hotels?${params.toString()}`);
    } else {
      navigate('/hotels');
    }
  };

  useEffect(() => {
    /**
     * Fetches initial data for the Home route.
     * @returns {Promise<void>} A promise that resolves when the data is fetched.
     */
    const getInitialData = async () => {
      // Mock dữ liệu popularDestinations thay vì gọi API
      const mockPopularDestinationsResponse = {
        data: {
          elements: [
            {
              code: 1,
              name: "Hà Nội",
              imageUrl: "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_258,q_auto,w_258/categoryimages/68/08/68088_v59.jpeg"
            },
            {
              code: 2,
              name: "Đà Nẵng",
              imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b"
            },
            {
              code: 3,
              name: "TP. Hồ Chí Minh",
              imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482"
            },
            {
              code: 4,
              name: "Nha Trang",
              imageUrl: "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_258,q_auto,w_258/categoryimages/68/09/68091_v72.jpeg"
            },
            {
              code: 5,
              name: "Đà Lạt",
              imageUrl: "https://images.unsplash.com/photo-1555921015-5532091f6026"
            }
          ]
        },
        errors: []
      };

      const hotelsResultsResponse = await get('api/hotels');

      // Mock dữ liệu availableCities
      const mockAvailableCitiesResponse = {
        data: {
          elements: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh", "Nha Trang", "Đà Lạt", "Phú Quốc", "Huế", "Hội An"]
        }
      };

      // Sử dụng mock data cho availableCities
      setAvailableCities(mockAvailableCitiesResponse.data.elements);

      // Sử dụng mock data cho popularDestinations
      setPopularDestinationsData({
        isLoading: false,
        data: mockPopularDestinationsResponse.data.elements,
        errors: mockPopularDestinationsResponse.errors,
      });
      
      console.log(hotelsResultsResponse);
      if (hotelsResultsResponse) {
        setHotelsResults({
          isLoading: false,
          data: hotelsResultsResponse,
          errors: hotelsResultsResponse.errors,
        });
      }
    };
    getInitialData();
  }, []);

  useEffect(() => {
    console.log("Current hotelsResults state:", hotelsResults);
  }, [hotelsResults]);

  return (
    <>
      <HeroCover
        locationInputValue={locationInputValue}
        numGuestsInputValue={numGuestsInputValue}
        locationTypeheadResults={filteredTypeheadResults}
        isDatePickerVisible={isDatePickerVisible}
        setisDatePickerVisible={setisDatePickerVisible}
        onLocationChangeInput={onLocationChangeInput}
        onNumGuestsInputChange={onNumGuestsInputChange}
        dateRange={dateRange}
        onDateChangeHandler={onDateChangeHandler}
        onDatePickerIconClick={onDatePickerIconClick}
        onSearchButtonAction={onSearchButtonAction}
      />
      <div className="container mx-auto">
        <PopularLocations popularDestinationsData={popularDestinationsData} />
        <div className="my-8">
          <h2 className="text-3xl font-medium text-slate-700 text-center my-2">
            Handpicked nearby hotels for you
          </h2>
          <ResultsContainer
            hotelsResults={hotelsResults}
            enableFilters={false}
          />
        </div>
      </div>
    </>
  );
};

export default Home;