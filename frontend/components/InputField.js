export default function InputField({ id, type = "text", placeholder, value, onChange, label, className }) {
    return (
      <div className={className}>
        {label && <label htmlFor={id}>{label}</label>}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }
  