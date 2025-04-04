import React from "react";

const CreateIssuePageSelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  options = [],
  valueKey = "id",
  labelKey = "name",
  className = "",
}) => {
  return (
    <div className="flex items-center gap-5">
      <label htmlFor={id} className="font-medium w-[120px]">
        {label}
        {required && "*"}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`border p-4 w-[400px] rounded-md bg-white drop-shadow-lg ${className}`}
      >
        {options.map((option, index) => (
          <option key={index} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CreateIssuePageSelectField;
