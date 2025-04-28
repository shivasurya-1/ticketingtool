import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillTextEditor = ({
  label,
  id,
  name,
  value,
  onChange,
  required = false,
  requiredFields = [],
  className = "",
  allowPdf = true, // Optional toggle for PDF input
}) => {
  const [editorContent, setEditorContent] = useState(value || "");
  const [pdfFile, setPdfFile] = useState(null);
  const [touched, setTouched] = useState(false);

  const isRequired = required || requiredFields.includes(name);
  const isEmpty = !editorContent || editorContent.replace(/<(.|\n)*?>/g, "").trim() === "";
  const showError = touched && isRequired && isEmpty;

  const handleChange = (content) => {
    setEditorContent(content);
    const syntheticEvent = {
      target: {
        name: name,
        value: content,
      },
    };
    onChange(syntheticEvent);
    if (!touched) setTouched(true);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);

      const syntheticEvent = {
        target: {
          name: `${name}_pdf`,
          value: file,
        },
      };
      onChange(syntheticEvent);
    }
  };

  useEffect(() => {
    if (value !== undefined && value !== editorContent) {
      setEditorContent(value);
    }
  }, [value]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
    "color",
    "background",
  ];

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center">
        <label htmlFor={id} className="font-medium flex items-center">
          {label}
          {isRequired && <span className="text-amber-500 ml-1 text-lg">*</span>}
        </label>
      </div>

      <div
        className={`
          border rounded-md transition-all duration-200 overflow-hidden
          ${showError
            ? "border-red-400 ring-2 ring-red-200"
            : touched && !isEmpty
              ? "border-green-400 ring-2 ring-green-200"
              : "border-gray-300"
          }
        `}
      >
        <div
          className={`quill-container ${className}`}
          style={{ height: className.includes("h-64") ? "auto" : "220px" }}
        >
          <ReactQuill
            id={id}
            theme="snow"
            value={editorContent}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            modules={modules}
            formats={formats}
            style={{ height: "100%" }}
            preserveWhitespace={true}
          />
        </div>
      </div>

      {showError && (
        <div className="text-red-500 text-sm">{label} is required</div>
      )}

      {isRequired && (
        <input
          type="hidden"
          name={name}
          value={editorContent}
          required={true}
          aria-hidden="true"
        />
      )}

    </div>
  );
};

export default QuillTextEditor;
