"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

export default function ItemComponent({ item, fields, onClick }) {
  return (
    <div className={styles.itemBlock} onClick={() => onClick(item)}>
      {fields.map((field) => (
        <div key={field} className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </span>
          <span className={styles.fieldValue}>{item[field]}</span>
        </div>
      ))}
    </div>
  );
}
