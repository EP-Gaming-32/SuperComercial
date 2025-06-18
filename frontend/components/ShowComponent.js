// components/ShowComponent.js
"use client";
import React from "react";
import styles from "./search.module.css"; // Seus estilos. Verifique se é o correto para este componente
import ItemComponent from "@/components/ItemComponent"; // Confirme este caminho

export default function ShowComponent({ data, fields, onItemClick, endpoint, idField }) {
  if (!data.length) return <p>Nenhum resultado.</p>;

  return (
    <div className={styles.resultsContainer}>
      {data.map((item) => (
        <ItemComponent
          key={item[idField]}
          item={item}
          fields={fields}
          onClick={onItemClick}
          endpoint={endpoint}
          idField={idField}
        />
      ))}
    </div>
  );
}