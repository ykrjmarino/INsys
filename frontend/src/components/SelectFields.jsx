function SelectField({ label, name, value, onChange, options, disabled, className }) {
  const safeValue = value ?? '';
  //default to "draft" if nothing is set
  
  return (
    <>
      <label htmlFor={name}> {label} </label>
      <select id={name} 
        className={className}
        required
        name={name} 
        value={value} 
        disabled={disabled}
        onChange={onChange}>
        <option value="" disabled hidden>-- Select --</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
    
  );
}


export default SelectField;

/*
<SelectField 
  label={label || 'edi wow'}
  name={name || 'gender'}
  value={selectedGender}
  onChange={(e) => setSelectedGender(e.target.value)}
  options={optionsArray}
  disabled={isValid}
/>
*/