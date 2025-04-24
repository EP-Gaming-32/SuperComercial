"use client";
import { useState } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoque from "@/components/form/FormPageEstoque";
import styles from "./detalhes.module.css"; // Reusing the same CSS module for consistency

export default function RegistrarEstoquePage() {
  // Initial data with the same fields as in the details page
  const initialData = {
    id_produto: "",
    id_fornecedor: "",
    id_filial: "",
    id_lote: "",
    local_armazenamento: "",
    quantidade: "",
    estoque_minimo: "",
    estoque_maximo: "",
    status_estoque: "",    // Although this field is calculated, we include it for consistency
    data_registro: "",     // Generally auto-generated, but here left empty
  };

  const [estoqueData, setEstoqueData] = useState(initialData);

  const handleCreate = (newData) => {
    console.log("Criando novo item no estoque:", newData);
    // Aqui você fará a chamada para a API para criar o novo item no estoque
  };

  return (
    <div className={styles.container} style={{ overflow: "hidden" }}>
      <h1>Registrar Novo Item no Estoque</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageEstoque data={estoqueData} mode="create" onSubmit={handleCreate} />
      </BoxComponent>
    </div>
  );
}
