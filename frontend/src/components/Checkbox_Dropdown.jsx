import React, { useState } from "react";

export default function CheckboxDropdown({
  options = [],           // [{ value: 1, label: "Section A" }]
  selected = [],           // [{ id: 1, name: "Section A" }]
  onChange,
  placeholder = "Select options",
  disabled,
  maxHeight = "150px",
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option) => {
    const exists = selected.some(s => s.id === option.value);
    if (exists) {
      onChange(selected.filter(s => s.id !== option.value));
    } else {
      onChange([...selected, { id: option.value, name: option.label, courseCode: course.code, yearNumber: year.number}]);
    }
  };

  return (
    <div style={{ position: "relative", width: "200px" }}>
      {/* Dropdown Trigger */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "3px",
          background: disabled ? "#eee" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          borderRadius: "4px",
          userSelect: "none",
        }}
        disabled={disabled}
        onClick={() => !disabled && setOpen(prev => !prev)}
      >
        {selected.length > 0
          ? `${selected.length} selected`
          : placeholder}
      </div>

      {/* Dropdown List */}
      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            border: "1px solid #ccc",
            background: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
            width: "100%",
            maxHeight,
            overflowY: "auto",
            borderRadius: "4px",
            marginTop: "2px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr", // two-column layout
          }}
        >
          {options.map(opt => (
            <label 
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                cursor: "pointer",
                color: "#000",
                gap: "4px"
              }}
            >
              <input
                type="checkbox"
                checked={selected.some(s => s.id === opt.value)}
                onChange={() => toggleOption(opt)}
                style={{
                  width: "18px",
                  height: "18px",
                  minWidth: "18px",
                  minHeight: "18px",
                  flexShrink: 0, // prevent it from shrinking in grid
                }}
              />
              <span style={{ marginLeft: "5px" }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
