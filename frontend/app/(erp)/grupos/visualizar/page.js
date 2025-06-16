// app/(erp)/grupos/visualizar/page.js
"use client";

import React from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function GruposPage() {
  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title=""
          endpoint="grupos"
          filters={[
            {
              name: "id_grupo",
              label: "ID",
              type: "text",
            },
            {
              name: "nome_grupo",
              label: "Grupo",
              type: "text",
            },
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar grupos"
          detailRoute="/grupos/detalhes"
          idField="id_grupo"
          showFields={[
            { value: "id_grupo", label: "ID"},
            { value: "nome_grupo", label: "Grupo"},
          ]}
          addButtonUrl="/grupos/registrar"
          addButtonLabel="Registrar Grupos"
        />
      </BoxComponent>
    </div>
  )
}