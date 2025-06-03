"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./home.module.css";

export default function CriticalStockAlert() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Este endpoint deve retornar apenas os itens cujo status_estoque = 'critico'
    fetch("http://localhost:5000/relatorios/estoque-detalhado?status=critico")
      .then((res) => res.json())
      .then((data) => {
        // data esperado: [{ nome_produto, nome_filial, quantidade }, ...]
        setAlerts(data);
      })
      .catch((err) => console.error("Erro ao carregar alertas de estoque crítico:", err));
  }, []);

  if (alerts.length === 0) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Alertas de Estoque Crítico</h2>
        <p className={styles.cardContent}>Nenhum produto em estado crítico.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>⚠️ Estoque Crítico</h2>
      <div className={styles.cardContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Filial</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((item, idx) => (
              <tr key={idx} className={styles.tableRow}>
                <td className={styles.flex}>
                  <AlertTriangle size={20} color="#f44336" /> {item.nome_produto}
                </td>
                <td>{item.nome_filial}</td>
                <td>{item.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
