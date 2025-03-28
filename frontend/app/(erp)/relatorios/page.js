"use client";
import React from "react";
import ProductVisual from "@/components/relatorios/ProductVisual";
import EstoqueVisual from "@/components/relatorios/EstoqueVisual";
import ComprasVisual from "@/components/relatorios/ComprasVisual";
import FilialVisual from "@/components/relatorios/FilialVisual";
import styles from "./relatorios.module.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <ProductVisual />
        </div>
        <div className={styles.card}>
          <EstoqueVisual />
        </div>
        <div className={styles.card}>
          <ComprasVisual />
        </div>
        <div className={styles.card}>
          <FilialVisual />
        </div>
      </div>
    </div>
  );
}
