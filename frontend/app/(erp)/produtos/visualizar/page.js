// app/(erp)/produtos/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";

export default function ProdutosPage() {
  const [groups, setGroups] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try {
        console.debug("[ProdutosPage] Buscando grupos e fornecedores...");
        const [gRes, fRes] = await Promise.all([
          fetch("http://localhost:5000/grupos"),
          fetch("http://localhost:5000/fornecedores"),
        ]);
        const groupsData = await gRes.json();
        const suppliersData = await fRes.json();
        setGroups(groupsData.data || groupsData);
        setSuppliers(suppliersData.data || suppliersData);
        console.debug(
          "[ProdutosPage] Grupos:",
          groupsData,
          "Fornecedores:",
          suppliersData
        );
      } catch (err) {
        console.error("[ProdutosPage] Erro ao carregar filtros:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilters();
  }, []);

  if (loading) return <p>Carregando filtros...</p>;

  return (
    <BoxComponent>
      <SearchPage
        title=""
        endpoint="produtos"
        hookParams={{ limit: 8 }}
        filters={[
          {
            name: "id_grupo",
            label: "Categoria",
            type: "select",
            options: groups.map((g) => ({
              value: g.id_grupo,
              label: g.nome_grupo,
            })),
          },
          {
            name: "id_fornecedor",
            label: "Fornecedor",
            type: "select",
            options: suppliers.map((f) => ({
              value: f.id_fornecedor,
              label: f.nome_fornecedor,
            })),
          },
          {
            name: "nome_produto",
            label: "Produto",
            placeholder: "Digite nome do produto",
          },
          {
            name: "unidade_medida",
            label: "Unidade de Medida",
            placeholder: "Ex: kg, un, pct",
          },
        ]}
        keywordName={null}
        keywordPlaceholder="Buscar produto..."
        detailRoute="/produtos/detalhes"
        idField="id_produto"
        showFields={[
          "nome_produto",
          "nome_grupo",
          "valor_produto",
          "nome_fornecedor",
          "prazo_validade",
        ]}
        addButtonUrl="/produtos/registrar"
        addButtonLabel="Registrar Produto"
      />
    </BoxComponent>
  );
}
