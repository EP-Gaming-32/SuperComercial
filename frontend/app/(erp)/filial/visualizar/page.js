// app/(erp)/filial/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function FilialPage() {
  const [carregando, setCarregando] = useState(false); // Mudado para false para evitar o loading inicial desnecessário

  // Removido o useEffect que não estava sendo usado para simplificar
  
  // if (carregando) return <p>Carregando Filtros</p>; // Removido pois a página já carrega direto

  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
        title="Filiais"
        endpoint="filial" // Certifique-se que o endpoint no backend é /filial
        hookParams={{ limit: 10 }}
        filters={[
          {
            name: "nome_filial",
            label: "Filial",
            type: "text"
          },
          {
            name: "endereco_filial",
            label: "Endereço",
            type: "text",
          },
          {
            // vv-- ESTA É A ÚNICA ALTERAÇÃO NECESSÁRIA AQUI --vv
            name: "telefone_filial",
            label: "Telefone",
            type: "tel" // Alterado de "text" para "tel"
          },
          {
            name: "gestor_filial",
            label: "Gestor",
            type: "text"
          },
        ]}
        keywordName={null}
        keywordPlaceholder="buscar filial"
        detailRoute="/filial/detalhes"
        idField="id_filial"
        showFields={[
          { value: "nome_filial", label: "Filial"},
          { value: "endereco_filial", label: "Endereço"},
          { value: "telefone_filial", label: "Telefone"},
          { value: "gestor_filial", label: "Gestor"},
        ]}
        addButtonUrl="/filial/registrar"
        addButtonLabel="Registrar Filial"
        />
      </BoxComponent>
    </div>
  )
}