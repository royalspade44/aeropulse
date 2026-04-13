import icons from './icons';

function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required = false
}) {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'input-error' : ''}
      />
      {error && (
        <div className="error-message">
          <img src={icons.diamondExclamation} alt="" className="inline-icon" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default InputField;
