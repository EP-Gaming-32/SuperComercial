'use client';

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function SearchPageOrdemCompra() {
  const [fornecedores, setFornecedores] = useState([]);
  const [statusOptions] = useState([
    { value: "Pendente", label: "Pendente" },
    { value: "Recebido", label: "Recebido" },
    { value: "Cancelado", label: "Cancelado" },
  ]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const resp = await fetch("http://localhost:5000/fornecedores");
        const json = await resp.json();
        setFornecedores(
          (json.data || []).map(f => ({
            value: f.id_fornecedor,
            label: f.nome_fornecedor,
          }))
        );
      } catch (err) {
        console.error("[SearchPageOrdemCompra] Erro ao carregar fornecedores", err);
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
              options: fornecedores,
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
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar ordem de compra"
          detailRoute="/ordem-compra/detalhes"
          idField="id_ordem_compra"
          showFields={[
            { value: "nome_fornecedor", label: "Fornecedor" },
            { value: "status", label: "Status" },
            { value: "data_ordem", label: "Data da Ordem" },
            { value: "valor_total", label: "Valor Total" },
          ]}
          addButtonUrl="/ordem-compra/registrar"
          addButtonLabel="Registrar Ordem"
        />
      </BoxComponent>
    </div>
  );
}