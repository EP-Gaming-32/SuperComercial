import React from "react";

const Card = ({ children, title }) => {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      margin: "10px 0",
      width: "100%",
      maxWidth: "500px"
    }}>
      {title && <h2 style={{ marginBottom: "15px", fontSize: "1.2rem", color: "#333" }}>{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
