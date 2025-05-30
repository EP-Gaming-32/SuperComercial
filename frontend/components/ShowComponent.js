"use client";
import React from "react";
import styles from "./search.module.css";
import ItemComponent from "@/components/ItemComponent";

export default function ShowComponent({ data, fields, onItemClick }) {
  if (!data.length) {
    return <p>No results found.</p>;
  }

  const getItemKey = (item) => {
    return (
      item.id ||
      item.produto_id ||
      item.cliente_id ||
      item.fornecedor_id ||
      item.funcionario_id ||
      item.usuario_id ||
      item.servico_id ||
      item.orcamento_id ||
      item.venda_id ||
      item.compra_id ||
      item.movimentacao_id ||
      item.codigo ||
      JSON.stringify(item) // fallback
    );
  };

  return (
    <div className={styles.resultsContainer}>
      {data.map((item) => (
        <ItemComponent
          key={getItemKey(item)}
          item={item}
          fields={fields}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}
