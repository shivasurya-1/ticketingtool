import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const SearchableSelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  valueKey,
  labelKey,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options || []);
  const dropdownRef = useRef(null);

  // Update filtered options when options change or search term changes
  useEffect(() => {
    if (options) {
      const filtered = options.filter((option) =>
        option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [options, searchTerm, labelKey]);

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

  // Get selected option label for display
  const getSelectedLabel = () => {
    if (!value || !options) return "";
    const selectedOption = options.find((option) => option[valueKey] === value);
    return selectedOption ? selectedOption[labelKey] : "";
  };

  const handleOptionSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  // Search icon SVG
  const SearchIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

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
            {getSelectedLabel() || "Select an assignee"}
          </span>
          <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Search input with icon */}
            <div className="sticky top-0 bg-white p-2 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  className="w-full p-2 pl-10 border rounded"
                  placeholder="Search assignees..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${
                      value === option[valueKey] ? "bg-blue-100" : ""
                    }`}
                    onClick={() => handleOptionSelect(option[valueKey])}
                  >
                    {option[labelKey]}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">
                  No matching assignees found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden actual select for form submission */}
        <select
          id={id}
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required}
          className="sr-only"
          aria-hidden="true"
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options &&
            options.map((option) => (
              <option key={option[valueKey]} value={option[valueKey]}>
                {option[labelKey]}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default SearchableSelectField;
