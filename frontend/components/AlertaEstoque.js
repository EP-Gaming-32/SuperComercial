"use client";
import React from "react";
import styles from "./AlertaEstoque.module.css";

export default function AlertaEstoque({ alerts = [] }) {
  return (
    <div className={styles.alertContainer}>
      <h3 className={styles.title}>Alerta de Baixo Estoque</h3>
      <div className={styles.alertList}>
        {alerts.length === 0 ? (
          <p className={styles.noAlerts}>Nenhum alerta no momento.</p>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className={styles.alertItem}>
              <span className={styles.productName}>{alert.productName}</span>
              <span className={styles.stockInfo}>Estoque: {alert.stock}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
