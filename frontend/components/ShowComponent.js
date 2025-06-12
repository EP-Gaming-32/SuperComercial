"use client";
import React from "react";
import styles from "./search.module.css";
import ItemComponent from "@/components/ItemComponent";

export default function ShowComponent({ data, fields, onItemClick }) {
  if (!data.length) return <p>Nenhum resultado.</p>;

  return (
    <div className={styles.resultsContainer}>
      {data.map(item => (
        <ItemComponent
          key={item.id || JSON.stringify(item)}
          item={item}
          fields={fields}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}