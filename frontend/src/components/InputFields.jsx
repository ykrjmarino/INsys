import React from "react";

function InputField ({ label, type="text", name, value, onChange, placeholder, id, className, disabled=false, maxLength, autocomplete, ref }) {
  return (
    <>   
      {/* <label>{label}</label> */}
      <input 
        required //works only in form submissions
        id={id || name}
        className={className}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autocomplete={autocomplete}
        ref={ref} 
      />
    </>
  );
}

export default InputField;

/*
  <InputField 
    className="ewan-ko"
    name="code"
    value={code} <-- must be string or number
    onChange={(e) => setCode(e.target.value)}
    placeholder="Enter student id"
    disabled={isVerified}
    autocomplete="off"
  />
*/