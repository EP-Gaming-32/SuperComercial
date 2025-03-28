import React from "react";

const Button = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        padding: "10px 20px", 
        background: "#007bff", 
        color: "white", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer", 
        transition: "background 0.3s", 
        fontSize: "1rem"
      }}
      onMouseOver={(e) => e.target.style.background = "#0056b3"}
      onMouseOut={(e) => e.target.style.background = "#007bff"}
    >
      {children}
    </button>
  );
};

export default Button;

  