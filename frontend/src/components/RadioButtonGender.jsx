import React from "react";

function RadioButtonGender({ label, name, value, onChange, options, divClassName = ""
}) {
  return (
    <div className={divClassName}>
      {label && <label>{label}</label>}
      <div className="registration-radio-group">
        {options.map((option, index) => {
          const id = option.value.toLowerCase(); // e.g. "Male" → "male"
          return (
            <React.Fragment key={index}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                required={index === 0} // only first one has required
              />
              <label htmlFor={id}>{option.label}</label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default RadioButtonGender;
