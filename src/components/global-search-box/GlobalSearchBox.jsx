import { faLocationDot, faPerson } from '@fortawesome/free-solid-svg-icons';
import DateRangePicker from '../ux/toast/date-range-picker/DateRangePicker';
import Input from '../ux/toast/input/Input';

/**
 * GlobalSearchBox Component
 * Renders a search box with input fields for location, number of guests, and a date range picker.
 * It includes a search button to trigger the search based on the entered criteria.
 *
 * @param {Object} props - Props for the component.
 * @param {string} props.locationInputValue - The current value of the location input.
 * @param {string} props.numGuestsInputValue - The current value of the number of guests input.
 * @param {boolean} props.isDatePickerVisible - Flag to control the visibility of the date picker.
 * @param {Function} props.onLocationChangeInput - Callback for location input changes.
 * @param {Function} props.onNumGuestsInputChange - Callback for number of guests input changes.
 * @param {Function} props.onDatePickerIconClick - Callback for the date picker icon click event.
 * @param {Array} props.locationTypeheadResults - Results for the location input typeahead.
 * @param {Function} props.onSearchButtonAction - Callback for the search button click event.
 * @param {Function} props.onDateChangeHandler - Callback for handling date range changes.
 * @param {Function} props.setisDatePickerVisible - Callback to set the visibility state of the date picker.
 * @param {Object} props.dateRange - The selected date range.
 */
const GlobalSearchBox = (props) => {
  const {
    locationInputValue,
    numGuestsInputValue,
    isDatePickerVisible,
    onLocationChangeInput,
    onNumGuestsInputChange,
    onDatePickerIconClick,
    locationTypeheadResults,
    onSearchButtonAction,
    onDateChangeHandler,
    setisDatePickerVisible,
    dateRange,
  } = props;
  return (
    <div className="flex flex-wrap flex-col lg:flex-row hero-content__search-box bg-white p-2 rounded-lg gap-2">
      <Input
        size="sm"
        value={locationInputValue}
        typeheadResults={locationTypeheadResults}
        icon={faLocationDot}
        onChangeInput={onLocationChangeInput}
        className="flex-1 border-2 border-yellow-400 rounded-md"
        containerClassName="flex-1"
      />
      <DateRangePicker
        isDatePickerVisible={isDatePickerVisible}
        onDatePickerIconClick={onDatePickerIconClick}
        onDateChangeHandler={onDateChangeHandler}
        setisDatePickerVisible={setisDatePickerVisible}
        dateRange={dateRange}
      />
      <Input
        size="sm"
        value={numGuestsInputValue}
        onChangeInput={onNumGuestsInputChange}
        placeholder="No. of guests"
        icon={faPerson}
        type="number"
        className="flex-1 border-2 border-yellow-400 rounded-md"
        containerClassName="flex-1"
      />
      <button
        className="flex-none w-full lg:w-auto px-6 py-2 bg-yellow-400 hover:bg-yellow-500 
                 text-white font-medium rounded-md transition-colors duration-200"
        onClick={onSearchButtonAction}
      >
        SEARCH
      </button>
    </div>
  );
};

export default GlobalSearchBox;