"use client";
import React from "react";
import PedidosByFilial from "@/components/relatorios/PedidosByFilial";
import EstoqueTreemap from "@/components/relatorios/EstoqueTreemap";
import FornecedorByFilial from "@/components/relatorios/FornecedorByFilial";
import PagamentoByFilial from "@/components/relatorios/PagamentoByFilial";
import ProdutosVencidos from "@/components/relatorios/ProdutosVencidos";
import PrevisaoPedidos from "@/components/relatorios/PrevisaoPedidos";
import FeedbackPedido from "@/components/relatorios/FeedbackPedido";
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
          <EstoqueTreemap/>
        </div>
        <div className={styles.card}>
          <FornecedorByFilial/>
        </div>
        <div className={styles.card}>
          <PagamentoByFilial/>
        </div>
        <div className={styles.card}>
          <PedidosByFilial/>
        </div>
        <div className={styles.card}>
          <PrevisaoPedidos/>
        </div>
        <div className={styles.card}>
          <ProdutosVencidos/>
        </div>
        <div className={styles.card}>
          <FeedbackPedido />
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
