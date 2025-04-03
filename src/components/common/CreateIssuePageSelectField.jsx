import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const CreateIssuePageSelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  options = [],
  valueKey,
  labelKey,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    value || options[0]?.[valueKey] || ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!value && options.length > 0) {
      const defaultValue = options[0][valueKey] || "";
      setSelectedValue(defaultValue);
      onChange({
        target: { name, value: defaultValue },
      });
    }
  }, [value, options, valueKey, name, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    onChange(e);
  };

  const handleOptionSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get selected option label for display
  const getSelectedLabel = () => {
    if (!selectedValue || !options) return "";
    const selectedOption = options.find((option) => option[valueKey] === selectedValue);
    return selectedOption ? selectedOption[labelKey] : "";
  };

  return (
    <div className="flex items-center gap-5 relative">
      <label htmlFor={id} className="font-medium w-[96px] flex-shrink-0">
        {label} {required && "*"}
      </label>

      <div className="relative w-[327px]" ref={dropdownRef}>
        {/* Custom select header */}
        <div
          className="border p-4 rounded-md bg-white drop-shadow-lg flex justify-between items-center cursor-pointer"
          onClick={toggleDropdown}
        >
          <span className="truncate">
            {getSelectedLabel() || "Select an option"}
          </span>
          <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Options list */}
            <div>
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${
                      selectedValue === option[valueKey] ? "bg-blue-100" : ""
                    }`}
                    onClick={() => handleOptionSelect(option[valueKey])}
                  >
                    {option[labelKey]}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No options available</div>
              )}
            </div>
          </div>
        )}

        {/* Hidden actual select for form submission */}
        <select
          id={id}
          name={name}
          value={selectedValue}
          onChange={handleChange}
          required={required}
          className="sr-only"
          aria-hidden="true"
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((option) => (
            <option key={option[valueKey]} value={option[valueKey]}>
              {option[labelKey]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CreateIssuePageSelectField;