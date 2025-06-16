// app/(erp)/filial/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function FilialPage() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try{
        console.log("[FilialPage] rodando");

      } catch (err) {
        console.error("[FilialPage] Erro ao carregar filtros")
      } finally {
        setCarregando(false);
      }
    }
    
    fetchFilters();

  }, []);

  if (carregando) return <p>Carregando Filtros</p>;

  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
        title=""
        endpoint="filial"
        hookParams={{ limit: 10 }}
        filters={[
          {
            name: "id_filial",
            label: "ID",
            type: "text"
          },
          {
            name: "nome_filial",
            label: "Filial",
            type: "text"
          },
          {
            name: "gestor_filial",
            label: "Gestor",
            type: "text"
          },
          {
            name: "endereco_filial",
            label: "Endereço",
            type: "text",
          }
        ]}
        keywordName={null}
        keywordPlaceholder="buscar filial"
        detailRoute="/filial/detalhes"
        idField="id_filial"
        showFields={[
          { value: "id_filial", label: "ID"},
          { value: "nome_filial", label: "Filial"},
          { value: "endereco_filial",label: "Endereço"},
          { value: "gestor_filial", label: "Gestor"},
        ]}
        addButtonUrl="/filial/registrar"
        addButtonLabel="Registrar Filial"
        />
      </BoxComponent>
    </div>
  )
}