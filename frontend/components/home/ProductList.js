// components/CriticalStockAlert.js
"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import PaginationComponent from "@/components/PaginationComponent";
import styles from "./home.module.css";

export default function CriticalStockAlert({ limit = 10 }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchAlertas() {
      // ...
      try {
        const params = new URLSearchParams({ page, limit });
        
        // APLIQUE A URL CORRETA E FUNCIONAL AQUI
        const res = await fetch(`http://localhost:5000/relatorios/estoque-alertas?${params.toString()}`);
        
        // ...
      } catch (err) {
        // ...
      } finally {
        // ...
      }
    }
    fetchAlertas();
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>⚠️ Alertas de Estoque</h2>
      <div className={styles.cardContent}>
        {loading && <p>Carregando alertas...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && alerts.length === 0 && (
          <p>Nenhum produto em estado crítico ou baixo.</p>
        )}
        {!loading && !error && alerts.length > 0 && (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Fornecedor</th>
                  <th>Filial</th>
                  <th>Status</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((item) => (
                  // 2. CORREÇÃO DA KEY: Usando um ID único do item (ex: id_estoque).
                  <tr key={item.id_estoque} className={styles.tableRow}>
                    <td className={styles.flex}>
                      <AlertTriangle size={20} color="#f44336" /> {item.nome_produto}
                    </td>
                    <td>{item.nome_fornecedor}</td>
                    <td>{item.nome_filial}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {item.status_estoque}
                    </td>
                    <td>{item.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}