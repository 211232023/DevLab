import React from 'react';
import './Input.css';

// 1. Envolva seu componente com React.forwardRef
// 2. Adicione 'ref' como o segundo argumento
const Input = React.forwardRef(({ type, id, name, placeholder, value, onChange, required, disabled, className }, ref) => {
    return (
        <input
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`custom-input ${className || ''}`}
            ref={ref} // 3. Passe a ref para o elemento <input>
        />
    );
});

export default Input;