import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const Input = (props) => {
  const {
    classes,
    value,
    onChangeInput,
    icon,
    type,
    placeholder,
    typeheadResults,
  } = props;
  const [isTypeheadVisible, setIsTypeheadVisible] = useState(false);

  const onTypeheadResultClick = (value) => {
    onChangeInput(value);
  };

  const onBlur = () => {
    // Delay hiding the typehead results to allow time for click event on result
    setTimeout(() => {
      setIsTypeheadVisible(false);
    }, 200);
  };

  return (
    <div className="relative flex-1 mx-2 first:ml-0 last:mr-0">
      <div className="flex w-full bg-white border-2 border-yellow-400 rounded-md overflow-hidden h-[48px]">
        <div className="relative flex-1">
          <input
            className="w-full px-10 bg-white text-gray-700 placeholder-gray-400 
                     focus:outline-none hover:bg-gray-50 transition-all duration-200 h-[48px]"
            type={type || 'text'}
            value={value}
            onChange={(e) => onChangeInput(e.target.value)}
            placeholder={placeholder}
            onBlur={onBlur}
            onFocus={() => setIsTypeheadVisible(true)}
          />
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600"
            />
          )}
        </div>
      </div>

      {/* Typeahead Results */}
      <div
        className={`absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg
                   ${isTypeheadVisible ? 'block' : 'hidden'}`}
      >
        <ul>
          {typeheadResults &&
            value.length > 0 &&
            typeheadResults.map((result, index) => (
              <li
                key={index}
                className="px-4 py-2 text-gray-700 capitalize cursor-pointer hover:bg-gray-50 
                         border-b border-gray-100 last:border-b-0"
                onClick={() => onTypeheadResultClick(result)}
              >
                {result}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Input;