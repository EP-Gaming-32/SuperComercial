"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function OrdemCompraPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Status fixos de OrdemCompra
  const statusOptions = [
    { value: "Pendente", label: "Pendente" },
    { value: "Recebido", label: "Recebido" },
    { value: "Cancelado", label: "Cancelado" },
  ];

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        console.log("[OrdemCompraPage] buscando fornecedores");
        const resp = await fetch("http://localhost:5000/fornecedor");
        const data = await resp.json();
        setFornecedores(data.data || data || []);
        console.log("[OrdemCompraPage] fornecedores:", data);
      } catch (err) {
        console.error("[OrdemCompraPage] Erro ao carregar fornecedores", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchFornecedores();
  }, []);

  if (carregando) return <p>Carregando filtros...</p>;

  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title="Ordens de Compra"
          endpoint="ordemCompra"
          hookParams={{ limit: 10 }}
          filters={[
            {
              name: "id_fornecedor",
              label: "Fornecedor",
              type: "select",
              options: fornecedores.map((f) => ({
                value: f.id_fornecedor,
                label: f.nome_fornecedor,
              })),
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            {
              name: "data_ordem",
              label: "Data da Ordem",
              type: "text",
            },
            {
              name: "data_entrega_prevista",
              label: "Previsto Entrega",
              type: "text",
            },
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar ordem"
          detailRoute="/ordem-compra/detalhes"
          idField="id_ordem_compra"
          showFields={[
            { value: "nome_fornecedor", label: "Fornecedor" },
            { value: "data_ordem", label: "Data da Ordem" },
            { value: "data_entrega_prevista", label: "Entrega Prevista" },
            { value: "valor_total", label: "Valor Total" },
            { value: "status", label: "Status Atual" },
          ]}
          addButtonUrl="/ordem-compra/registrar"
          addButtonLabel="Registrar Ordem"
        />
      </BoxComponent>
    </div>
  );
}