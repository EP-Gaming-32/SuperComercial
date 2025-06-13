// app/(erp)/lotes/visualizar/page.js
"use client";

import React, { useState, useEffect, use } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function LotesPage(){
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try{
        console.log("[LotesPage] buscando produtos");
        const [produtosResposta] = await Promise.all([
          fetch("http://localhost:5000/produtos"),
        ]);

        const produtosData = await produtosResposta.json();

        setProdutos(produtosData.data || produtosData);
        
        console.log(
          "[LotesPage] Produtos: ",
          produtosData,
        );
      } catch (err) {
        console.error("[LotesPage] Erro ao carregar filtros", err);
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
        title=""
        endpoint="lotes"
        hookParams={{ limit: 10}}
        filters={[
          {
            name: "id_produto",
            Label: "Produto",
            type: "select",
            options: produtos.map((p) => ({
              value: p.id_produto,
              label: p.nome_produto,
            }))
          },
          {
            name: "codigo_lote",
            label: "Código",
            type: "text",
          },
          {
            name: "data_expedicao",
            label: "Expedição",
            type: "text"
          },
          {
            name: "data_validade",
            label: "Validade",
            type: "text"
          },
          {
            name: "quantidade",
            label: "Quantidade",
            type: "text"
          },
        ]}
        keywordName={null}
        keywordPlaceholder="buscar lotes"
        detailRoute="/lotes/detalhes"
        idField="id_lote"
        showFields={[
          "codigo_lote",
          "quantidade",
          "data_expedicao",
          "data_validade",
          "quantidade",
        ]}
        addButtonUrl="/lotes/registrar"
        addButtonLabel="Registrar Lote"
        />
      </BoxComponent>
    </div>
  )
}