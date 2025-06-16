import React from "react";

const ColoredText = () => {
  return (
    <h1>
      <span
        style={{
          color: "white",
          textShadow: "4px 4px 10px black", // Add the text shadow here
        }}
      >
        Super
      </span>
      <span style={{ color: "#29b6f6",
        textShadow: "2px 2px 10px rgb(0, 149, 255)"
       }}>Comercial</span>{" "}
    </h1>
  );
};

export default ColoredText;
