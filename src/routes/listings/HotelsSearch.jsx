import React, { useState, useEffect, useCallback } from 'react';
import GlobalSearchBox from '../../components/global-search-box/GlobalSearchBox';
import ResultsContainer from '../../components/results-container/ResultsContainer';
import { get } from '../../utils/request';
import isEmpty from '../../utils/helpers';
import { MAX_GUESTS_INPUT_VALUE } from '../../utils/constants';
import { formatDate } from '../../utils/date-helpers';
import { useLocation, useSearchParams } from 'react-router-dom';
import { parse } from 'date-fns';
import PaginationController from '../../components/ux/PaginationController';
import { SORTING_FILTER_LABELS } from '../../utils/constants';
import _debounce from 'lodash/debounce';
import Select from 'react-select';

const HotelsSearch = () => {
    // 1. Khai báo states
    const [isDatePickerVisible, setisDatePickerVisible] = useState(false);
    const [locationInputValue, setLocationInputValue] = useState('');
    const [numGuestsInputValue, setNumGuestsInputValue] = useState('');
    const [availableCities, setAvailableCities] = useState([]);
    const [currentResultsPage, setCurrentResultsPage] = useState(1);
    const [filtersData, setFiltersData] = useState({ isLoading: true, data: [], errors: [] });
    const [hotelsResults, setHotelsResults] = useState({ isLoading: true, data: [], errors: [] });
    const [dateRange, setDateRange] = useState([{ startDate: null, endDate: null, key: 'selection' }]);
    const [sortByFilterValue, setSortByFilterValue] = useState({ value: 'default', label: 'Sort by' });
    const [selectedFiltersState, setSelectedFiltersState] = useState([]);
    const [filteredTypeheadResults, setFilteredTypeheadResults] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // Định nghĩa cứng bộ lọc ratings
    const hardcodedFilters = [
        {
            filterId: 'starRatings',
            title: 'Đánh giá sao',
            filters: [
                { id: 'star5', title: '5 sao', value: 5, isSelected: false },
                { id: 'star4', title: '4 sao', value: 4, isSelected: false },
                { id: 'star3', title: '3 sao', value: 3, isSelected: false },
                { id: 'star2', title: '2 sao', value: 2, isSelected: false },
                { id: 'star1', title: '1 sao', value: 1, isSelected: false },
            ],
        },
        {
            filterId: 'priceRange',
            title: 'Khoảng giá',
            filters: [
                { id: 'price1', title: 'Dưới 1 triệu', value: '0,1000000', isSelected: false },
                { id: 'price2', title: '1 - 2 triệu', value: '1000000,2000000', isSelected: false },
                { id: 'price3', title: '2 - 3 triệu', value: '2000000,3000000', isSelected: false },
                { id: 'price4', title: '3 - 5 triệu', value: '3000000,5000000', isSelected: false },
                { id: 'price5', title: 'Trên 5 triệu', value: '5000000,100000000', isSelected: false },
            ],
        }
    ];

    const sortingFilterOptions = [
        { value: 'default', label: 'Sort by' },
        { value: 'priceLowToHigh', label: SORTING_FILTER_LABELS.PRICE_LOW_TO_HIGH },
        { value: 'priceHighToLow', label: SORTING_FILTER_LABELS.PRICE_HIGH_TO_LOW },
    ];

    const handleSortChange = useCallback((selectedOption) => {
        setSortByFilterValue(selectedOption);
        
        // Cập nhật URL và gọi API ngay lập tức
        const params = new URLSearchParams(searchParams);
        
        if (selectedOption.value !== 'default') {
            params.set('sortBy', selectedOption.value.startsWith('price') ? 'price' : 'rating');
            params.set('sortDirection', selectedOption.value.endsWith('HighToLow') ? 'desc' : 'asc');
        } else {
            params.delete('sortBy');
            params.delete('sortDirection');
        }
        
        setSearchParams(params);

        // Chuẩn bị filters cho API call
        const filters = {};
        for (const [key, value] of params.entries()) {
            if (key === 'starRatings') {
                filters[key] = value.split(',').map(Number);
            } else if (key === 'priceRange') {
                const [min, max] = value.split(',');
                filters.minPrice = parseFloat(min);
                filters.maxPrice = parseFloat(max);
            } else if (!['sortBy', 'sortDirection'].includes(key)) {
                filters[key] = value;
            }
        }

        // Thêm ngày check-in/check-out nếu có
        if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
            filters.checkInDate = formatDate(dateRange[0].startDate);
            filters.checkOutDate = formatDate(dateRange[0].endDate);
        }

        fetchHotels(filters);
    }, [searchParams, dateRange, setSearchParams]);

    // 2. Khai báo fetchHotels trước
    const fetchHotels = async (filters) => {
        setHotelsResults(prev => ({ ...prev, isLoading: true }));

        try {
            const queryParams = new URLSearchParams();

            // Xử lý các filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (key === 'starRatings') {
                        queryParams.set(key, Array.isArray(value) ? value.join(',') : value);
                    } else if (Array.isArray(value)) {
                        queryParams.set(key, value.join(','));
                    } else {
                        queryParams.set(key, value);
                    }
                });
            }

            // Thêm params cho phân trang
            queryParams.set('page', String(currentResultsPage - 1));

            // Thêm params cho sort
            if (sortByFilterValue.value !== 'default') {
                queryParams.set('sortBy', sortByFilterValue.value.startsWith('price') ? 'price' : 'rating');
                queryParams.set('sortDirection', sortByFilterValue.value.endsWith('HighToLow') ? 'desc' : 'asc');
            }

            const url = `api/hotels?${queryParams.toString()}`;
            console.log('Fetching hotels with URL:', url);

            const hotelsResultsResponse = await get(url);

            if (hotelsResultsResponse) {
                setHotelsResults({
                    isLoading: false,
                    data: hotelsResultsResponse,
                    errors: hotelsResultsResponse.errors || [],
                    metadata: hotelsResultsResponse.metadata,
                    pagination: hotelsResultsResponse.paging,
                });
            } else {
                throw new Error("API response is empty");
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
            setHotelsResults({
                isLoading: false,
                data: [],
                errors: [error.message || "Failed to fetch hotels"]
            });
        }
    };

    // 3. Khai báo debouncedFetchHotels sau khi có fetchHotels
    const debouncedFetchHotels = useCallback(
        _debounce((filters) => {
            fetchHotels(filters);
        }, 500),
        [fetchHotels] // Thêm fetchHotels vào dependencies
    );

    // 4. Các hàm xử lý filters
    const getActiveFiltersFromState = (state) => {
        const filters = {};
        state.forEach((category) => {
            const selectedValues = category.filters
                .filter((filter) => filter.isSelected)
                .map((filter) => filter.value);

            if (selectedValues.length > 0) {
                filters[category.filterId] = selectedValues;
            }
        });
        return isEmpty(filters) ? null : filters;
    };

    const onFiltersUpdate = useCallback((updatedFilter) => {
        // Cập nhật state filters
        setSelectedFiltersState(prevState => {
            const newState = prevState.map(filterGroup => {
                if (filterGroup.filterId === updatedFilter.filterId) {
                    return {
                        ...filterGroup,
                        filters: filterGroup.filters.map(filter => {
                            if (filter.id === updatedFilter.id) {
                                return { ...filter, isSelected: !filter.isSelected };
                            }
                            return filter;
                        }),
                    };
                }
                return filterGroup;
            });

            // Lấy filters đang active
            const activeFilters = getActiveFiltersFromState(newState);
            const params = new URLSearchParams(searchParams);

            // Xử lý params URL
            if (activeFilters) {
                Object.entries(activeFilters).forEach(([key, values]) => {
                    if (key === 'starRatings') {
                        params.set(key, values.join(','));
                    } else if (key === 'priceRange' && values.length > 0) {
                        params.set(key, values[0]);
                    }
                });
            } else {
                params.delete('starRatings');
                params.delete('priceRange');
            }

            // Cập nhật URL
            setSearchParams(params);

            // Chuẩn bị filters cho API call
            const filters = {};
            for (const [key, value] of params.entries()) {
                if (key === 'starRatings') {
                    filters[key] = value.split(',').map(Number);
                } else if (key === 'priceRange') {
                    const [min, max] = value.split(',');
                    filters.minPrice = parseFloat(min);
                    filters.maxPrice = parseFloat(max);
                } else if (key !== 'sortBy' && key !== 'sortDirection') {
                    filters[key] = value;
                }
            }

            // Thêm ngày check-in/check-out nếu có
            if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
                filters.checkInDate = formatDate(dateRange[0].startDate);
                filters.checkOutDate = formatDate(dateRange[0].endDate);
            }

            // Gọi API ngay lập tức thay vì dùng debounce
            fetchHotels(filters);

            return newState;
        });
    }, [searchParams, dateRange, fetchHotels]);

    const onDateChangeHandler = (ranges) => {
        setDateRange([ranges.selection]);
    };

    const onSearchButtonAction = () => {
        updateSearchParams();
    };

    const onDatePickerIconClick = () => {
        setisDatePickerVisible(!isDatePickerVisible);
    };

    const onLocationChangeInput = async (newValue) => {
        setLocationInputValue(newValue);
        queryResults(newValue, availableCities);
    };

    function queryResults(query, availableCities) {
        const filteredResults = availableCities
            .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
        setFilteredTypeheadResults(filteredResults);
    }

    const onNumGuestsInputChange = (numGuests) => {
        if (numGuests < MAX_GUESTS_INPUT_VALUE && numGuests > 0) {
            setNumGuestsInputValue(numGuests);
        }
    };

    const onClearFiltersAction = () => {
        setSelectedFiltersState(prevState => {
            return prevState.map(filterGroup => ({
                ...filterGroup,
                filters: filterGroup.filters.map(filter => ({ ...filter, isSelected: false })),
            }));
        });

        setTimeout(() => updateSearchParams(), 0);
    };

    const handlePageChange = (page) => {
        setCurrentResultsPage(page);
    };

    const handlePreviousPageChange = () => {
        setCurrentResultsPage((prev) => (prev <= 1 ? prev : prev - 1));
    };

    const handleNextPageChange = () => {
        setCurrentResultsPage((prev) => (prev >= hotelsResults.pagination?.totalPages ? prev : prev + 1));
    };

    const updateSearchParams = () => {
        const params = new URLSearchParams();

        if (locationInputValue) {
            params.set('city', locationInputValue);
        }

        if (numGuestsInputValue) {
            params.set('numOfGuests', numGuestsInputValue);
        }

        params.set('page', String(currentResultsPage - 1));

        if (sortByFilterValue.value !== 'default') {
            params.set('sortBy', sortByFilterValue.value.startsWith('price') ? 'price' : 'rating');
            params.set('sortDirection', sortByFilterValue.value.endsWith('HighToLow') ? 'desc' : 'asc');
        }

        const activeFilters = getActiveFiltersFromState(selectedFiltersState);
        if (activeFilters) {
            Object.entries(activeFilters).forEach(([key, values]) => {
                if (key === 'starRatings') {
                    params.set(key, values.join(','));
                } else if (key === 'priceRange' && values.length > 0) {
                    params.set(key, values[0]);
                } else {
                    params.set(key, Array.isArray(values) ? values.join(',') : values);
                }
            });
        }

        setSearchParams(params);

        const filters = {};
        for (const [key, value] of params.entries()) {
            if (key === 'starRatings') {
                filters[key] = value.split(',').map(Number);
            } else if (key === 'priceRange') {
                const [min, max] = value.split(',');
                filters.minPrice = parseFloat(min);
                filters.maxPrice = parseFloat(max);
            } else if (key !== 'sortBy' && key !== 'sortDirection') {
                filters[key] = value;
            }
        }

        if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
            filters.checkInDate = formatDate(dateRange[0].startDate);
            filters.checkOutDate = formatDate(dateRange[0].endDate);
        }

        fetchHotels(filters);
    };

    const fetchHotelsFromParams = () => {
        const params = Object.fromEntries(searchParams.entries());
        const filters = {};

        if (params.city) {
            filters.city = params.city;
        }

        if (params.numOfGuests) {
            filters.numOfGuests = parseInt(params.numOfGuests, 10);
        }

        if (params.starRatings) {
            filters.starRatings = params.starRatings.split(',').map(Number);
        }

        if (params.priceRange) {
            const priceRange = params.priceRange.split(',');
            filters.minPrice = parseFloat(priceRange[0]);
            filters.maxPrice = parseFloat(priceRange[1]);
        }

        Object.keys(params).forEach(key => {
            if (['city', 'numOfGuests', 'starRatings', 'priceRange', 'page', 'sortBy', 'sortDirection'].includes(key)) return;
            filters[key] = params[key];
        });

        if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
            filters.checkInDate = formatDate(dateRange[0].startDate);
            filters.checkOutDate = formatDate(dateRange[0].endDate);
        }

        fetchHotels(filters);
    };

    useEffect(() => {
        setFiltersData({
            isLoading: false,
            data: hardcodedFilters,
            errors: [],
        });
        setSelectedFiltersState(hardcodedFilters);
    }, []);

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        
        const updates = {};
        
        if (params.city !== locationInputValue) {
            updates.locationInput = params.city || '';
        }
        
        if (params.numOfGuests !== numGuestsInputValue) {
            updates.numGuests = params.numOfGuests || '';
        }
        
        if (params.page && (parseInt(params.page, 10) + 1) !== currentResultsPage) {
            updates.page = parseInt(params.page, 10) + 1;
        }

        if (Object.keys(updates).length > 0) {
            if (updates.locationInput !== undefined) setLocationInputValue(updates.locationInput);
            if (updates.numGuests !== undefined) setNumGuestsInputValue(updates.numGuests);
            if (updates.page !== undefined) setCurrentResultsPage(updates.page);
        }

        if (selectedFiltersState.length > 0) {
            setSelectedFiltersState(prevState => {
                const needsUpdate = prevState.some(filterGroup => {
                    const paramValues = params[filterGroup.filterId];
                    if (!paramValues) return false;
                    
                    const selectedValues = paramValues.split(',');
                    return filterGroup.filters.some(filter => 
                        selectedValues.includes(String(filter.value)) !== filter.isSelected
                    );
                });

                if (!needsUpdate) return prevState;

                return prevState.map(filterGroup => {
                    const paramValues = params[filterGroup.filterId];
                    if (!paramValues) return filterGroup;

                    const selectedValues = paramValues.split(',');
                    return {
                        ...filterGroup,
                        filters: filterGroup.filters.map(filter => ({
                            ...filter,
                            isSelected: selectedValues.includes(String(filter.value)),
                        })),
                    };
                });
            });
        }
    }, [searchParams]);

    useEffect(() => {
        if (!hotelsResults.isLoading) {
            updateSearchParams();
        }
    }, [currentResultsPage]);

    useEffect(() => {
        const getCities = async () => {
            try {
                const citiesResponse = await get('api/cities');
                if (citiesResponse) {
                    setAvailableCities(citiesResponse);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
                setAvailableCities([]);
            }
        };

        getCities();

        if (searchParams.toString()) {
            fetchHotelsFromParams();
        }
    }, []);

    // Component cho phần sort
    const SortByFilter = () => {
        const sortOptions = [
            { value: 'default', label: 'Sort by' },
            { value: 'priceHighToLow', label: 'Price (High to Low)' },
            { value: 'priceLowToHigh', label: 'Price (Low to High)' },
            { value: 'ratingHighToLow', label: 'Rating (High to Low)' },
            { value: 'ratingLowToHigh', label: 'Rating (Low to High)' }
        ];

        return (
            <Select
                value={sortByFilterValue}
                onChange={handleSortChange}
                options={sortOptions}
                className="w-48"
                classNamePrefix="select"
            />
        );
    };

    return (
        <div className="hotels">
            <div className="bg-brand px-2 lg:h-[120px] h-[220px] flex items-center justify-center">
                <GlobalSearchBox
                    locationInputValue={locationInputValue}
                    locationTypeheadResults={filteredTypeheadResults}
                    numGuestsInputValue={numGuestsInputValue}
                    isDatePickerVisible={isDatePickerVisible}
                    setisDatePickerVisible={setisDatePickerVisible}
                    onLocationChangeInput={onLocationChangeInput}
                    onNumGuestsInputChange={onNumGuestsInputChange}
                    dateRange={dateRange}
                    onDateChangeHandler={onDateChangeHandler}
                    onDatePickerIconClick={onDatePickerIconClick}
                    onSearchButtonAction={onSearchButtonAction}
                />
            </div>
            <div className="my-4"></div>
            <div className="w-[180px]"></div>
            <div className="flex justify-end mb-4">
                <SortByFilter />
            </div>
            <ResultsContainer
                hotelsResults={hotelsResults}
                enableFilters={true}
                filtersData={filtersData}
                onFiltersUpdate={onFiltersUpdate}
                onClearFiltersAction={onClearFiltersAction}
                selectedFiltersState={selectedFiltersState}
                sortByFilterValue={sortByFilterValue}
                onSortingFilterChange={handleSortChange}
                sortingFilterOptions={sortingFilterOptions}
            />
            {hotelsResults.pagination?.totalPages > 1 && (
                <div className="my-4">
                    <PaginationController
                        currentPage={currentResultsPage}
                        totalPages={hotelsResults.pagination?.totalPages}
                        handlePageChange={handlePageChange}
                        handlePreviousPageChange={handlePreviousPageChange}
                        handleNextPageChange={handleNextPageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default HotelsSearch;