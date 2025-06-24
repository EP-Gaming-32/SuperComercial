"use client";
import React from "react";
// Relatórios originais
import PedidosByFilial from "@/components/relatorios/PedidosByFilial";
import EstoqueTreemap from "@/components/relatorios/EstoqueTreemap";
import FornecedorByFilial from "@/components/relatorios/FornecedorByFilial";
import PagamentoByFilial from "@/components/relatorios/PagamentoByFilial";
import ProdutosVencidos from "@/components/relatorios/ProdutosVencidos";
import PrevisaoPedidos from "@/components/relatorios/PrevisaoPedidos";
import EstoqueUnificado from "@/components/relatorios/EstoqueUnificado";
import ComprasVisual from "@/components/relatorios/ComprasVisual";
import FilialVisual from "@/components/relatorios/FilialVisual";
// Novos relatórios implementados
import PagamentosPorForma from "@/components/relatorios/PagamentosPorForma";
import RankingFornecedores from "@/components/relatorios/RankingFornecedores";
import ProdutosMaisVendidos from "@/components/relatorios/ProdutosMaisVendidos";
import GiroEstoque from "@/components/relatorios/GiroEstoque";
import MapaCalorEstoque from "@/components/relatorios/MapaCalorEstoque";
import styles from "./relatorios.module.css";

export default function Dashboard() {
  // Organização dos relatórios por categoria
  const relatoriosOriginais = [
    { component: PedidosByFilial, title: "Pedidos por Filial", category: "Operacional" },
    { component: EstoqueUnificado, title: "Análise Completa de Estoque", category: "Estoque" },
    { component: FilialVisual, title: "Filiais Visual", category: "Operacional" },
    { component: ProdutosVencidos, title: "Produtos Vencidos", category: "Estoque" }
  ];

  const novosRelatorios = [
    { component: PagamentosPorForma, title: "Pagamentos por Forma", category: "Financeiro" },
    { component: ProdutosMaisVendidos, title: "Produtos Mais Vendidos", category: "Produtos" },
  ];

  const todosRelatorios = [...relatoriosOriginais, ...novosRelatorios];

  return (
    <div className={styles.dashboardContainer}>
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"/>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
          </svg>
          Relatórios SuperComercial
        </h1>
        <p className={styles.pageSubtitle}>
          Análises completas e insights para tomada de decisão estratégica
        </p>
      </div>

      {/* Seção de Novos Relatórios */}
      <div className={styles.sectionContainer}>
        <div className={styles.dashboardGrid}>
          {novosRelatorios.map((relatorio, index) => {
            const Component = relatorio.component;
            return (
              <div key={`novo-${index}`} className={`${styles.card} ${styles.newCard}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.newBadge}>NOVO</span>
                  <span className={styles.categoryBadge}>{relatorio.category}</span>
                </div>
                <Component />
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção de Relatórios Originais */}
      <div className={styles.sectionContainer}>
        
        <div className={styles.dashboardGrid}>
          {relatoriosOriginais.map((relatorio, index) => {
            const Component = relatorio.component;
            return (
              <div key={`original-${index}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.categoryBadge}>{relatorio.category}</span>
                </div>
                <Component />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}