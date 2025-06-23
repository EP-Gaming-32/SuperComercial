// app/(erp)/fornecedores/visualizar/page.js
"use client";

import React from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import styles from "./visualizar.module.css";
import { formatCpfCnpj } from "@/utils/formatters";

export default function FornecedorPage() {
  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title="Fornecedores"
          endpoint="fornecedores"
          hookParams={{ limit: 10 }}
          filters={[
            {
              name: "nome_fornecedor",
              label: "Fornecedor",
              type: "text",
            },
            {
              name: "cnpj_cpf",
              label: "CNPJ/CPF",
              type: "text",
            },
            {
              name: "email_fornecedor",
              label: "Email",
              type: "text",
            },
            {
              name: "telefone_fornecedor",
              label: "Telefone",
              type: "tel", // Tipo corrigido para usar a máscara
            },
            {
              name: "tipo_pessoa",
              label: "Tipo",
              type: "select",
              options: [
                { value: "Fisica", label: "Física" },
                { value: "Juridica", label: "Jurídica" },
              ],
            },
          ]}
          keywordName={null}
          keywordPlaceholder="buscar fornecedor"
          detailRoute="/fornecedores/detalhes"
          idField="id_fornecedor"
          showFields={[
            { value: "nome_fornecedor", label: "Fornecedor" },
            { value: "cnpj_cpf", label: "CNPJ/CPF" },
            { value: "email_fornecedor", label: "Email" },
            { value: "telefone_fornecedor", label: "Telefone" },
          ]}
          addButtonUrl="/fornecedores/registrar"
          addButtonLabel="Registrar Fornecedor"
        />
      </BoxComponent>
    </div>
  );
}