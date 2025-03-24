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

const HotelsSearch = () => {
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
    const debounceFn = useCallback(_debounce(queryResults, 1000), []);
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

    const onSortingFilterChange = (selectedOption) => {
        setSortByFilterValue(selectedOption);
        setTimeout(() => updateSearchParams(), 0);
    };

    const onFiltersUpdate = (updatedFilter) => {
        setSelectedFiltersState(prevState => {
            return prevState.map(filterGroup => {
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
        });

        setTimeout(() => updateSearchParams(), 0);
    };

    const onDateChangeHandler = (ranges) => {
        setDateRange([ranges.selection]);
    };

    const onSearchButtonAction = () => {
        updateSearchParams();
    };

    const getActiveFilters = () => {
        const filters = {};
        selectedFiltersState.forEach((category) => {
            const selectedValues = category.filters
                .filter((filter) => filter.isSelected)
                .map((filter) => filter.value);

            if (selectedValues.length > 0) {
                filters[category.filterId] = selectedValues;
            }
        });
        return isEmpty(filters) ? null : filters;
    };

    const onDatePickerIconClick = () => {
        setisDatePickerVisible(!isDatePickerVisible);
    };

    const onLocationChangeInput = async (newValue) => {
        setLocationInputValue(newValue);
        debounceFn(newValue, availableCities);
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

    const fetchHotels = async (filters) => {
        setHotelsResults({ isLoading: true, data: [], errors: [] });

        let url = 'api/hotels?';

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (Array.isArray(filters[key])) {
                    filters[key].forEach(value => {
                        url += `${key}=${encodeURIComponent(value)}&`;
                    });
                } else {
                    url += `${key}=${encodeURIComponent(filters[key])}&`;
                }
            });
        }

        url += `page=${currentResultsPage - 1}&`;

        if (sortByFilterValue.value !== 'default') {
            url += `sortBy=${sortByFilterValue.value.startsWith('price') ? 'price' : 'rating'}&`;
            url += `sortDirection=${sortByFilterValue.value.endsWith('HighToLow') ? 'desc' : 'asc'}&`;
        }

        url = url.slice(0, -1);

        try {
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
                console.error("API response is null or undefined");
                setHotelsResults({
                    isLoading: false,
                    data: [],
                    errors: ["API response is empty"]
                });
            }
        } catch (error) {
            console.error("Error fetching hotels:", error);
            setHotelsResults({
                isLoading: false,
                data: [],
                errors: ["Failed to fetch hotels"]
            });
        }
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

        const activeFilters = getActiveFilters();
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

        if (params.city) {
            setLocationInputValue(params.city);
        }

        if (params.numOfGuests) {
            setNumGuestsInputValue(params.numOfGuests);
        }

        if (params.page) {
            setCurrentResultsPage(parseInt(params.page, 10) + 1);
        }

        if (params.sortBy && params.sortDirection) {
            const sortValue = params.sortBy === 'price'
                ? (params.sortDirection === 'asc' ? 'priceLowToHigh' : 'priceHighToLow')
                : 'default';

            const sortOption = sortingFilterOptions.find(opt => opt.value === sortValue);
            if (sortOption) {
                setSortByFilterValue(sortOption);
            }
        }

        if (selectedFiltersState.length > 0) {
            setSelectedFiltersState(prevState => {
                return prevState.map(filterGroup => {
                    const paramValues = params[filterGroup.filterId];
                    if (paramValues) {
                        const selectedValues = paramValues.split(',');
                        return {
                            ...filterGroup,
                            filters: filterGroup.filters.map(filter => ({
                                ...filter,
                                isSelected: selectedValues.includes(String(filter.value)),
                            })),
                        };
                    }
                    return filterGroup;
                });
            });
        }
    }, [searchParams, selectedFiltersState.length]);

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
            <ResultsContainer
                hotelsResults={hotelsResults}
                enableFilters={true}
                filtersData={filtersData}
                onFiltersUpdate={onFiltersUpdate}
                onClearFiltersAction={onClearFiltersAction}
                selectedFiltersState={selectedFiltersState}
                sortByFilterValue={sortByFilterValue}
                onSortingFilterChange={onSortingFilterChange}
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