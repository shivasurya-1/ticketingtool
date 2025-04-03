import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!value && options.length > 0) {
      const defaultValue = options[0][valueKey] || "";
      setSelectedValue(defaultValue);
      onChange({
        target: { name, value: defaultValue },
      });
    }
  }, [value, options, valueKey, name, onChange]);

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    onChange(e);
  };

  return (
    <div className="flex items-center gap-5">
      <label htmlFor={id} className="font-medium w-[120px]">
        {label} {required && "*"}
      </label>
      <select
        id={id}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        required={required}
        aria-label={label}
        className="border p-4 w-[400px] rounded-md bg-white drop-shadow-lg"
      >
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CreateIssuePageSelectField;
