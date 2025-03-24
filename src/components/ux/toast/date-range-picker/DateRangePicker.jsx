import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { DateRange } from 'react-date-range';
import { formatDate } from '../../../../utils/date-helpers';
import useOutsideClickHandler from '../../../../hooks/UseOutSideClickHandler';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRangePicker = (props) => {
  const {
    isDatePickerVisible,
    onDatePickerIconClick,
    onDateChangeHandler,
    dateRange,
    setisDatePickerVisible,
  } = props;

  const wrapperRef = useRef();
  useOutsideClickHandler(wrapperRef, () => setisDatePickerVisible(false));

  const formattedStartDate = dateRange[0].startDate
    ? formatDate(dateRange[0].startDate)
    : 'Check-in';
  const formattedEndDate = dateRange[0].endDate
    ? formatDate(dateRange[0].endDate)
    : 'Check-out';

  return (
    <div className="relative flex flex-1" data-testid="date-range-picker">
      <div className="flex w-full bg-white border-2 border-yellow-400 rounded-md overflow-hidden">
        {/* Check-in input */}
        <div className="relative flex-1">
          <input
            className="w-full px-10 py-3 bg-white text-gray-700 placeholder-gray-400
                     focus:outline-none focus:bg-gray-50 transition-all duration-200"
            type="text"
            value={formattedStartDate}
            onFocus={onDatePickerIconClick}
            placeholder="Check-in"
            readOnly
          />
          <FontAwesomeIcon
            icon={faCalendar}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 my-2"></div>

        {/* Check-out input */}
        <div className="relative flex-1">
          <input
            className="w-full px-10 py-3 bg-white text-gray-700 placeholder-gray-400
                     focus:outline-none focus:bg-gray-50 transition-all duration-200"
            type="text"
            value={formattedEndDate}
            onFocus={onDatePickerIconClick}
            placeholder="Check-out"
            readOnly
          />
          <FontAwesomeIcon
            icon={faCalendar}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600"
          />
        </div>
      </div>

      {/* Date Range Picker Popup */}
      {isDatePickerVisible && (
        <div 
          ref={wrapperRef}
          className="absolute top-full left-0 mt-2 z-50 transform transition-all duration-200 
                   ease-out scale-100 opacity-100 bg-white rounded-lg shadow-2xl"
        >
          <DateRange
            editableDateInputs={true}
            onChange={onDateChangeHandler}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            minDate={new Date()}
            direction="horizontal"
            className="border-0"
            rangeColors={['#2563EB']} // Blue-600 color
            monthDisplayFormat="MMMM yyyy"
            color="#2563EB"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;