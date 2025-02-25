import HeroCover from './components/HeroCover';
import PopularLocations from './components/PopularLocations';
import { useState, useCallback } from 'react';
import { MAX_GUESTS_INPUT_VALUE } from '../../utils/constants';
import ResultsContainer from '../../components/results-container/ResultsContainer';
import { formatDate } from '../../utils/date-helpers';
import { useNavigate } from 'react-router-dom';
import _debounce from 'lodash/debounce';

const Home = () => {
  const navigate = useNavigate();
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState('');
  const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
  const [availableCities] = useState(['New York', 'Los Angeles', 'Chicago', 'Houston']);
  const [filteredTypeheadResults, setFilteredTypeheadResults] = useState([]);

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

  const onLocationChangeInput = (newValue) => {
    setLocationInputValue(newValue);
    debounceFn(newValue, availableCities);
  };

  function queryResults(query, availableCities) {
    const filteredResults = availableCities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTypeheadResults(filteredResults);
  }

  const onNumGuestsInputChange = (numGuests) => {
    if ((numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) || numGuests === '') {
      setNumGuestsInputValue(numGuests);
    }
  };

  const onDateChangeHandler = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const onSearchButtonAction = () => {
    const numGuest = Number(numGuestsInputValue);
    const checkInDate = formatDate(dateRange[0].startDate) ?? '';
    const checkOutDate = formatDate(dateRange[0].endDate) ?? '';
    const city = locationInputValue;
    navigate('/hotels', {
      state: {
        numGuest,
        checkInDate,
        checkOutDate,
        city,
      },
    });
  };

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
        <PopularLocations popularDestinationsData={{ isLoading: false, data: availableCities, errors: [] }} />
        <div className="my-8">
          <h2 className="text-3xl font-medium text-slate-700 text-center my-2">
            Handpicked nearby hotels for you
          </h2>
          <ResultsContainer hotelsResults={{ isLoading: false, data: [], errors: [] }} enableFilters={false} />
        </div>
      </div>
    </>
  );
};

export default Home;
