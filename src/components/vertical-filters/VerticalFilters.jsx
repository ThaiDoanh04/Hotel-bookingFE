import React from "react";
import Checkbox from "../ux/toast/Checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
/**
 * VerticalFilters Component
 * Renders a vertical filter UI for filtering hotel results.
 *
 * @param {Object} props - Props for the component.
 * @param {Array} props.filtersData - An array of filters data objects to display.
 * @param {Function} props.onFiltersUpdate - Callback function to handle filter updates.
 * @param {Function} props.onClearFiltersAction - Callback function to handle clearing of filters.
 * @param {boolean} props.isVerticalFiltersOpen - Flag to control the visibility of the vertical filters.
 */
const VerticalFilters = (props) => {
  const {
    filtersData,
    onFiltersUpdate,
    onClearFiltersAction,
    isVerticalFiltersOpen,
  } = props;

  const isActiveFilterSelected = () => {
    for (const filterGroup of filtersData) {
      for (const subfilter of filterGroup.filters) {
        if (subfilter.isSelected) {
          return true;
        }
      }
    }
    return false;
  };

  // Đếm số lượng filter đã chọn
  const getSelectedFilterCount = () => {
    let count = 0;
    for (const filterGroup of filtersData) {
      for (const subfilter of filterGroup.filters) {
        if (subfilter.isSelected) {
          count++;
        }
      }
    }
    return count;
  };

  const selectedCount = getSelectedFilterCount();

  return (
    <div
      className={`hotels-filters__container rounded-lg shadow-lg border w-[270px] z-10 ${
        isVerticalFiltersOpen ? '' : 'hidden'
      } absolute top-10 left-2 bg-white md:block md:static md:shadow-md transition-all duration-300`}
      data-testid="vertical-filters"
    >
      <div className="hotels-filters__header flex justify-between items-center py-3 border-b px-4 bg-gray-50 rounded-t-lg">
        <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-indigo-500" />
          Bộ lọc
          {selectedCount > 0 && (
            <span className="ml-2 bg-indigo-500 text-white px-2 py-0.5 rounded-full text-xs">
              {selectedCount}
            </span>
          )}
        </h4>
        <button
          className={`text-sm flex items-center gap-1 px-3 py-1.5 font-medium rounded-md 
            ${isActiveFilterSelected()
              ? 'text-red-600 hover:bg-red-50 border border-red-200 transition-colors duration-200'
              : 'text-gray-400 cursor-not-allowed border border-gray-200'}`}
          onClick={onClearFiltersAction}
          disabled={!isActiveFilterSelected()}
        >
          <FontAwesomeIcon icon={faXmark} />
          Xóa
        </button>
      </div>

      <div className="p-2">
        {filtersData.map((filter) => (
          <div 
            className="mb-4 pb-4 border-b border-gray-100 last:border-0" 
            key={filter.filterId}
          >
            <h4 className="text-sm font-bold text-gray-700 mb-3 px-2">
              {filter.title}
            </h4>
            <div className="space-y-2">
              {filter.filters.map((subfilter) => (
                <Checkbox
                  key={subfilter.id}
                  id={subfilter.id}
                  label={subfilter.title}
                  isSelected={subfilter.isSelected}
                  filterId={filter.filterId}
                  onFiltersUpdate={onFiltersUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isActiveFilterSelected() && (
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t">
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
            onClick={() => {
              // Có thể thêm logic áp dụng filter nếu cần
              console.log("Applied filters");
            }}
          >
            Áp dụng bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default VerticalFilters;