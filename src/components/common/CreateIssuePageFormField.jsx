// components/FormField.jsx
import React from "react";

const CreateIssuePageFormField = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  className = "",
  placeholder = "",
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-5">
      <label htmlFor={id} className="font-medium w-[120px]">
        {label}{required && "*"}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`border p-4 w-[400px] rounded-md drop-shadow-lg ${disabled ? 'cursor-[not-allowed]' : ''} ${className}`}
      />
    </div>
  );
};

export default CreateIssuePageFormField;