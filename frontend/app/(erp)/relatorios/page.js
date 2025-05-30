"use client";
import React from "react";
import PedidosByFilial from "@/components/relatorios/PedidosByFilial";
import EstoqueTreemap from "@/components/relatorios/EstoqueTreemap";
import FornecedorByFilial from "@/components/relatorios/FornecedorByFilial";
import PagamentoByFilial from "@/components/relatorios/PagamentoByFilial";
import ProdutosVencidos from "@/components/relatorios/ProdutosVencidos";
import PrevisaoPedidos from "@/components/relatorios/PrevisaoPedidos";
import ProductVisual from "@/components/relatorios/ProductVisual";
import EstoqueVisual from "@/components/relatorios/EstoqueVisual";
import ComprasVisual from "@/components/relatorios/ComprasVisual";
import FilialVisual from "@/components/relatorios/FilialVisual";
import styles from "./relatorios.module.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardGrid}>
        {[ProductVisual, EstoqueTreemap, FornecedorByFilial, PagamentoByFilial, 
          PedidosByFilial, PrevisaoPedidos, ProdutosVencidos, 
          EstoqueVisual, ComprasVisual, FilialVisual].map((Component, index) => (
          <div key={index} className={styles.card}>
            <Component />
          </div>
        ))}
      </div>
    </div>
  );
}
