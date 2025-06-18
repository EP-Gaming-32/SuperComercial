// components/ShowComponent.js
"use client";
import React from "react";
import styles from "./search.module.css";
import ItemComponent from "@/components/ItemComponent";

// Adicionamos 'data = []' como um valor padrão para segurança máxima.
export default function ShowComponent({ data = [], fields, onItemClick, endpoint, idField }) {
  
  // Adicionado console.log para depuração
  console.log(`[ShowComponent] Props Recebidas:`, { data });
  
  // Verificação de segurança extra: garante que 'data' é uma array antes de continuar.
  if (!Array.isArray(data) || data.length === 0) {
    // Não renderiza a mensagem de "Nenhum resultado" aqui, 
    // pois o SearchPage já faz isso. Apenas retorna nulo para não renderizar nada.
    return null;
  }

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