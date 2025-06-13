// app/(erp)/fornecedor/visualizar/page.js
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";

export default function FornecedorPage() {
  return(
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title=""
          endpoint="fornecedores"
          hookParams={{ limit: 10}}
          filters={[
            {
              name: "id_fornecedor",
              label: "ID",
              type: "text"
            },
            {
              name: "nome_fornecedor",
              label: "Fornecedor",
              type: "text"
            },
            {
              name: "tipo_pessoa",
              label: "Tipo",
              type: "select",
              options: [
                { value: "fisica", label: "Física"},
                { value: "juridica", label: "Jurídica"},
              ]
            },
            {
              name: "cnpj_cpf",
              label: "CNPJ/CPF",
              type: "text",
            }
          ]}
          keywordName={null}
          keywordPlaceholder="buscar fornecedor"
          detailRoute="/fornecedores/detalhes"
          idField="id_fornecedor"
          showFields={[
            "id_fornecedor",
            "nome_fornecedor",
            "tipo_pessoa",
            "cnpj_cpf",
          ]}
          addButtonUrl="/fornecedores/registrar"
          addButtonLabel="Registrar Fornecedor"
        />
      </BoxComponent>
    </div>
  )
}