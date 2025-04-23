"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

export default function ItemComponent({ item, fields, onClick }) {
  const handleDelete = async (e) => {
    e.stopPropagation(); // evita abrir detalhes no clique
    const confirm = window.confirm("Tem certeza que deseja excluir?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/produtos/${item.id_produto}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Produto excluído com sucesso!");
        window.location.reload(); // atualização rápida
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao excluir o produto.");
      }
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      alert("Erro na conexão com o servidor.");
    }
  };

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

      <button className={styles.deleteButton} onClick={handleDelete}>
        X
      </button>
    </div>
  );
}
