import React from "react";
import "./Button.css";

const Button = ({ children, onClick, type = "button", style }) => {
  return (
    <button className="btn" onClick={onClick} type={type} style={style}>
      {children}
    </button>
  );
};

export default Button;
