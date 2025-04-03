import React, { useEffect } from "react";
import { getNames } from "country-list";

const CountrySelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
}) => {
  let countryOptions = getNames().map((country) => ({
    value: country,
    label: country,
  }));

  // Move India to the top
  countryOptions = [
    { value: "India", label: "India" },
    ...countryOptions
      .filter((c) => c.value !== "India")
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  return (
    <div className="flex items-center gap-5">
      <label htmlFor={id} className="font-medium w-[96px] flex-shrink-0">
        {label} {required && "*"}
      </label>
      <select
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        aria-label={label}
        className="border p-4 w-[327px] rounded-md bg-white drop-shadow-lg"
      >
        <option value="" disabled>
          Select a country
        </option>

        {countryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelectField;