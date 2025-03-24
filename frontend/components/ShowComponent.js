// components/ShowComponent.js
"use client";

import React from "react";
import styles from "./search.module.css";
import Link from "next/link"; // if using Link for navigation

export default function ShowComponent({ data, onItemClick }) {
  if (!data.length) {
    return <p>No results found.</p>;
  }

  return (
    <div className={styles.resultsContainer}>
      <ul className={styles.resultsList}>
        {data.map((item) => (
          <li
            key={item.id}
            className={styles.resultItem}
            onClick={() => onItemClick(item)}
            style={{ cursor: "pointer" }}
          >
            <span className={styles.itemName}>{item.name}</span>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}
