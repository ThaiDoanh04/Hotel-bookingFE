import React, { useState, useEffect, useCallback } from 'react';
import GlobalSearchBox from '../../components/global-search-box/GlobalSearchBox';
import ResultsContainer from '../../components/results-container/ResultsContainer';
import PaginationController from '../../components/ux/toast/PaginationController';
import { SORTING_FILTER_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/date-helpers';
import { useLocation, useSearchParams } from 'react-router-dom';
import { parse } from 'date-fns';
import _debounce from 'lodash/debounce';

const mockHotelsData = [
  { id: 1, name: 'Hotel A', price: 100, city: 'pune' },
  { id: 2, name: 'Hotel B', price: 150, city: 'mumbai' },
  { id: 3, name: 'Hotel C', price: 200, city: 'delhi' },
];

const mockFiltersData = [
  { filterId: 'price', filters: [{ id: 'low', value: 'low', isSelected: false }] },
];

const HotelsSearch = () => {
  const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState('pune');
  const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [filtersData, setFiltersData] = useState(mockFiltersData);
  const [hotelsResults, setHotelsResults] = useState({ isLoading: false, data: mockHotelsData });
  const [sortByFilterValue, setSortByFilterValue] = useState({ value: 'default', label: 'Sort by' });
  const [selectedFiltersState, setSelectedFiltersState] = useState(mockFiltersData);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const sortingFilterOptions = [
    { value: 'default', label: 'Sort by' },
    { value: 'priceLowToHigh', label: SORTING_FILTER_LABELS.PRICE_LOW_TO_HIGH },
    { value: 'priceHighToLow', label: SORTING_FILTER_LABELS.PRICE_HIGH_TO_LOW },
  ];

  const onSortingFilterChange = (selectedOption) => {
    setSortByFilterValue(selectedOption);
  };

  const onFiltersUpdate = (updatedFilter) => {
    setSelectedFiltersState(
      selectedFiltersState.map((filterGroup) => ({
        ...filterGroup,
        filters: filterGroup.filters.map((filter) =>
          filter.id === updatedFilter.id ? { ...filter, isSelected: !filter.isSelected } : filter
        ),
      }))
    );
  };

  const onSearchButtonAction = () => {
    setSearchParams({ city: locationInputValue, numGuests: numGuestsInputValue });
  };

  const handlePageChange = (page) => setCurrentResultsPage(page);

  return (
    <div className="hotels">
      <div className="bg-brand px-2 lg:h-[120px] h-[220px] flex items-center justify-center">
        <GlobalSearchBox
          locationInputValue={locationInputValue}
          numGuestsInputValue={numGuestsInputValue}
          isDatePickerVisible={isDatePickerVisible}
          setisDatePickerVisible={setisDatePickerVisible}
          onSearchButtonAction={onSearchButtonAction}
        />
      </div>
      <ResultsContainer
        hotelsResults={hotelsResults}
        enableFilters={true}
        filtersData={filtersData}
        onFiltersUpdate={onFiltersUpdate}
        selectedFiltersState={selectedFiltersState}
        sortByFilterValue={sortByFilterValue}
        onSortingFilterChange={onSortingFilterChange}
        sortingFilterOptions={sortingFilterOptions}
      />
      <PaginationController
        currentPage={currentResultsPage}
        totalPages={3}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default HotelsSearch;