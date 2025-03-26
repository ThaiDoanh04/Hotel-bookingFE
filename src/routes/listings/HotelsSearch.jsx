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
import HotelViewCard from '../../components/hotel-view-card/HotelViewCard';
import HotelViewCardSkeleton from '../../components/hotel-view-card-skeleton/HotelViewCardSkeleton';
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
    const fetchHotels = async (filters = {}) => {
        try {
            setHotelsResults({
                isLoading: true,
                data: [],
                errors: []
            });

            let url;
            let params = new URLSearchParams();
            
            // Kiểm tra filters có phức tạp không để quyết định dùng endpoint nào
            const hasComplexFilters = filters.minPrice || filters.maxPrice || 
                                     filters.starRatings || filters.sortBy;
            
            if (hasComplexFilters) {
                // Sử dụng endpoint /filter cho các filter phức tạp
                url = 'api/hotels/filter';
                
                // Thêm city
                if (filters.city) {
                    params.append('city', filters.city);
                }
                
                // Thêm price range
                if (filters.minPrice) {
                    params.append('minPrice', filters.minPrice);
                }
                if (filters.maxPrice) {
                    params.append('maxPrice', filters.maxPrice);
                }
                
                // Thêm star rating (API chỉ nhận một giá trị starRating)
                if (filters.starRatings && filters.starRatings.length > 0) {
                    // Nếu có nhiều giá trị, chọn giá trị cao nhất
                    const highestRating = Math.max(...filters.starRatings);
                    params.append('starRating', highestRating);
                }
                
                // Thêm numOfGuests
                if (filters.numGuest) {
                    params.append('numOfGuests', filters.numGuest);
                }
                
                // Thêm sorting
                if (filters.sortBy) {
                    params.append('sortBy', filters.sortBy);
                    params.append('sortDirection', filters.sortDirection || 'asc');
                }
                
                // Phân trang
                params.append('page', filters.page || 0);
                params.append('size', filters.size || 10);
                
            } else if (filters.city || filters.numGuest) {
                // Sử dụng endpoint /search cho tìm kiếm đơn giản
                url = 'api/hotels/search';
                
                if (filters.city) {
                    params.append('city', filters.city);
                }
                
                if (filters.numGuest) {
                    params.append('numOfGuests', filters.numGuest);
                }
            } else {
                // Không có filter nào, dùng endpoint mặc định
                url = 'api/hotels';
            }
            
            // Thêm query params nếu có
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            console.log("Calling API:", url);
            
            const response = await get(url);
            console.log("API response:", response);
            
            if (response) {
                let hotelData = [];
                let pagination = null;
                
                // Xử lý response tùy thuộc vào API endpoint
                if (url.includes('/filter')) {
                    // API filter trả về cấu trúc phân trang
                    hotelData = response.hotels || [];
                    pagination = {
                        totalElements: response.totalElements || 0,
                        totalPages: response.totalPages || 0,
                        currentPage: response.currentPage || 0
                    };
                } else {
                    // API khác trả về array trực tiếp
                    hotelData = Array.isArray(response) ? response : [];
                }
                
                setHotelsResults({
                    isLoading: false,
                    data: hotelData,
                    pagination: pagination,
                    errors: []
                });
                
                console.log("Processed hotel data:", hotelData);
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
        const filters = {};
        
        // Lấy tất cả params từ URL
        for (const [key, value] of searchParams.entries()) {
            if (key === 'city') {
                filters.city = value;
            } else if (key === 'numGuest') {
                filters.numGuest = parseInt(value);
            } else if (key === 'starRatings') {
                filters.starRatings = value.split(',').map(Number);
            } else if (key === 'priceRange') {
                const [min, max] = value.split(',');
                filters.minPrice = parseFloat(min);
                filters.maxPrice = parseFloat(max);
            } else if (key === 'sortBy') {
                filters.sortBy = value;
            } else if (key === 'sortDirection') {
                filters.sortDirection = value;
            }
        }
        
        // Thêm ngày check-in/check-out nếu có
        if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
            filters.checkInDate = formatDate(dateRange[0].startDate);
            filters.checkOutDate = formatDate(dateRange[0].endDate);
        }
        
        // Gọi API với tất cả filters
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

        // Kiểm tra params từ URL
        const cityParam = searchParams.get('city');
        if (cityParam) {
            // Cập nhật input location
            setLocationInputValue(cityParam);
            
            // Sử dụng endpoint search vì chỉ có city
            fetchHotels({ city: cityParam });
        } else if (searchParams.toString()) {
            // Nếu có các params khác, xử lý toàn bộ params
            fetchHotelsFromParams();
        } else {
            // Không có params, lấy tất cả khách sạn
            fetchHotels({});
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

    // Kiểm tra dữ liệu trước khi render
    console.log("Current hotel results:", hotelsResults);

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