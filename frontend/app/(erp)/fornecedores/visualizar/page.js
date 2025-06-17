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
          title="Fornecedores"
          endpoint="fornecedores"
          hookParams={{ limit: 10}}
          // <<--- AQUI ESTÁ A ALTERAÇÃO DOS FILTROS ---
          filters={[
            {
              name: "nome_fornecedor", // 1º - Nome do Fornecedor
              label: "Fornecedor",
              type: "text"
            },
            {
              name: "cnpj_cpf", // 2º - CNPJ/CPF
              label: "CNPJ/CPF",
              type: "text",
            },
            {
              name: "email_fornecedor", // NOVO - Email
              label: "Email",
              type: "text"
            },
            {
              name: "telefone_fornecedor", // NOVO - Telefone
              label: "Telefone",
              type: "text"
            },
            {
              name: "tipo_pessoa", // Mantido - Tipo
              label: "Tipo",
              type: "select",
              options: [
                { value: "Fisica", label: "Física"},
                { value: "Juridica", label: "Jurídica"},
              ]
            },
            // <<--- REMOVIDO: O FILTRO DE ID ---
          ]}
          // <<------------------------------------------
          keywordName={null}
          keywordPlaceholder="buscar fornecedor"
          detailRoute="/fornecedores/detalhes"
          idField="id_fornecedor"
          showFields={[
            { value: "nome_fornecedor", label: "Fornecedor"},
            { value: "cnpj_cpf", label: "CNPJ/CPF"},
            { value: "email_fornecedor", label: "Email"},
            { value: "telefone_fornecedor", label: "Telefone"},
          ]}
          addButtonUrl="/fornecedores/registrar"
          addButtonLabel="Registrar Fornecedor"
        />
      </BoxComponent>
    </div>
  )
}