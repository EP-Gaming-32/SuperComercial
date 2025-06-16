"use client";
import React from "react";
import styles from "./search.module.css";
import ItemComponent from "@/components/ItemComponent";

// 1. Receba a prop 'idField' aqui, na lista de argumentos da função
export default function ShowComponent({ data, fields, onItemClick, endpoint, idField }) {
  if (!data.length) return <p>Nenhum resultado.</p>;

  return (
    <div className={styles.resultsContainer}>
      {data.map((item) => (
        <ItemComponent
          // 2. CORREÇÃO: Use a 'idField' para a chave dinâmica e única.
          // Para a página de estoque, isso será 'item.id_estoque'.
          // Para outras páginas, será o que você definir no SearchPage.
          key={item[idField]}
          item={item}
          fields={fields}
          onClick={onItemClick}
          endpoint={endpoint} // repassa endpoint para ItemComponent
        />
      ))}
    </div>
  );
}