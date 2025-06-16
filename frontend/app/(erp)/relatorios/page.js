"use client";
import React from "react";
// Relatórios originais
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
    { component: EstoqueVisual, title: "Estoque Visual", category: "Estoque" },
    { component: ProductVisual, title: "Produtos Visual", category: "Produtos" },
    { component: FilialVisual, title: "Filiais Visual", category: "Operacional" },
    { component: PrevisaoPedidos, title: "Previsão de Pedidos", category: "Previsão" },
    { component: ProdutosVencidos, title: "Produtos Vencidos", category: "Estoque" }
  ];

  const novosRelatorios = [
    { component: PagamentosPorForma, title: "Pagamentos por Forma", category: "Financeiro" },
    { component: ProdutosMaisVendidos, title: "Produtos Mais Vendidos", category: "Produtos" },
    { component: GiroEstoque, title: "Giro de Estoque", category: "Estoque" },
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
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{relatoriosOriginais.length}</span>
            <span className={styles.statLabel}>Relatórios Originais</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{novosRelatorios.length}</span>
            <span className={styles.statLabel}>Novos Relatórios</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{todosRelatorios.length}</span>
            <span className={styles.statLabel}>Total de Relatórios</span>
          </div>
        </div>
      </div>

      {/* Seção de Novos Relatórios */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Novos Relatórios Avançados
          </h2>
          <p className={styles.sectionDescription}>
            Relatórios modernos com análises avançadas e insights de negócio
          </p>
        </div>
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
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Relatórios Essenciais
          </h2>
          <p className={styles.sectionDescription}>
            Relatórios fundamentais modernizados com novo design e funcionalidades
          </p>
        </div>
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