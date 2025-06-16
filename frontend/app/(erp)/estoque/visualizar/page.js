// app/(erp)/estoque/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function EstoquePage() {
  const [grupos, setGrupos] = useState([]);
  const [filial, setFilial] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [lote, setLote] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try{
        console.log("[EstoquePage] buscando grupos,fornecedores, filiais");
        const [grupoResposta, filialResposta, fornecedorResposta, lotesResposta] = await Promise.all([
          fetch("http://localhost:5000/grupos"),
          fetch("http://localhost:5000/filial"),
          fetch("http://localhost:5000/fornecedores"),
          fetch("http://localhost:5000/lotes"),
        ]);

        const gruposData = await grupoResposta.json();
        const filialData = await filialResposta.json();
        const fornecedorData = await fornecedorResposta.json();
        const loteData = await lotesResposta.json();

        setGrupos(gruposData.data || gruposData);
        setFilial(filialData.data || filialData);
        setFornecedores(fornecedorData.data || fornecedorData);
        setLote(loteData.data || loteData);

        console.log(
          "[EstoquePage] Grupos:",
          gruposData,
          "Fornecedores: ",
          fornecedorData,
          "filial: ",
          filialData,
          "Lote: ",
          loteData,
        );
      } catch (err) {
        console.error("[EstoquePage] Erro ao carregar filtros", err);
      } finally {
        setCarregando(false);
      }
    }

    fetchFilters();

  }, []);

  if (carregando) return <p>Carregando Filtros...</p>;

  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title="Estoque"
          endpoint="estoque"
          hookParams={{ limit: 10}}
          filters={[
            {
              name: "id_filial",
              label: "Filial",
              type: "select",
              options: filial.map((fi) => ({
                value: fi.id_filial,
                label: fi.nome_filial,
              })),
            },
            {
              name: "id_fornecedor",
              label: "Fornecedor",
              type: "select",
              options: fornecedores.map((fo) => ({
                value: fo.id_fornecedor,
                label: fo.nome_fornecedor,
              })),
            },
            {
              name: "id_lote",
              label: "Lote",
              type: "select",
              options: lote.map((l) => ({
                value: l.id_lote,
                label: l.codigo_lote,
              })),
            },
            {
              name: "status_estoque",
              label: "Status do Estoque",
              type: "select",
              options: [
                { value: "normal", label: "Normal" },
                { value: "baixo", label: "Baixo" },
                { value: "critico", label: "Crítico" },
              ],
            }
          ]}
          keywordName={null}
          keywordPlaceholder="buscar estoque"
          detailRoute="/estoque/detalhes"
          idField="id_estoque"
          showFields={[
            { value: "nome_produto", label: "Produto"},
            { value: "nome_filial", label: "Filial"},
            { value: "codigo_lote", label: "Código"},
            {value: "quantidade", label: "Quantidade"},
            {value: "status_estoque", label: "Status"},
            {value: "nome_fornecedor", label: "Fornecedor"}
          ]}
          addButtonUrl="/estoque/registrar"
          addButtonLabel="Registrar Estoque"
        />
      </BoxComponent>
    </div>
  );
}