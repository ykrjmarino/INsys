import React from "react";

function RadioButtonOptions({ label, name, value, onChange, options, divClassName = "", divClassName2 = ""
}) {
  return (
    <div className={divClassName}>
      {label && <label>{label}</label>}
        {options.map((option, index) => {
          const id = `${name}-${index}`

          const safeValue = value ?? ''; 
          return (
            <div key={index} className={divClassName2}>
              <input
                type="radio"
                id={id}
                name={name} 
                value={option}
                checked={safeValue === option}
                onChange={onChange}
                required={index === 0} // only first one has required
              />
              <label htmlFor={id}>{option}</label>
            </div>
          );
        })}
    </div>
  );
}

export default RadioButtonOptions;

/*
  <RadioButtonOptions
    name={name}
    value={value}
    onChange={onChange} //(e) => setCode(e.target.value)
    options={mcqOptions}
    divClassName={divClassName}
  />




*/
