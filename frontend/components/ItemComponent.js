"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

export default function ItemComponent({ item, fields, onClick }) {
  const handleDelete = async (e) => {
    e.stopPropagation(); // Evita trigger de onClick principal

    const confirmDelete = window.confirm("Tem certeza que deseja excluir?");
    if (!confirmDelete) return;

    // Detecta o nome do ID automaticamente (ex: id_produto, id_lote etc.)
    const idField = Object.keys(item).find((key) => key.startsWith("id_"));

    if (!idField) {
      alert("ID não identificado para exclusão.");
      return;
    }

    const endpoint = idField.replace("id_", ""); // ex: produto, lote, pedido
    const idValue = item[idField];

    try {
      const res = await fetch(`http://localhost:5000/${endpoint}s/${idValue}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} excluído com sucesso!`);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao excluir.");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro na conexão com o servidor.");
    }
  };

  return (
    <div className={styles.itemBlock} onClick={() => onClick(item)}>
      {fields.map((fieldObj) => {
        const key = typeof fieldObj === "string" ? fieldObj : fieldObj.value;
        const label = typeof fieldObj === "string" ? fieldObj : fieldObj.label;

        return (
          <div key={key} className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>{label}:</span>
            <span className={styles.fieldValue}>{item[key]}</span>
          </div>
        );
      })}

      <button className={styles.deleteButton} onClick={handleDelete}>
        Excluir
      </button>
    </div>
  );
}
