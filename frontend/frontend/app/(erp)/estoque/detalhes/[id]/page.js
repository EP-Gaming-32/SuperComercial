"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css"; // Page-specific styles for details
import BoxComponent from "@/components/BoxComponent"; // A box component wrapping the form
import FormPageEstoque from "@/components/form/FormPageEstoque"; // The inventory form component

export default function DetalhesEstoquePage() {
  const { id } = useParams();
  const [estoqueData, setEstoqueData] = useState(null);

  useEffect(() => {
    // Mock data for the Estoque table (adjust as necessary)
    const mockData = {
      id_estoque: id,
      id_produto: 101,
      id_fornecedor: 5,
      id_filial: 2,
      id_lote: 10,
      local_armazenamento: "Depósito Central",
      quantidade: 50,
      estoque_minimo: 20,
      estoque_maximo: 100,
      status_estoque: "normal", // Calculado: 'normal', 'baixo' ou 'critico'
      data_registro: "2024-01-15 10:00:00"
    };
    setEstoqueData(mockData);
  }, [id]);

  const handleUpdate = (updatedData) => {
    console.log("Atualizando item do estoque:", updatedData);
    // API call to update inventory data would go here.
  };

  return (
    <div className={styles.container}>
      <h1>Editar Item do Estoque</h1>
      {estoqueData ? (
        <BoxComponent className={styles.formWrapper}>
          <FormPageEstoque
            data={estoqueData}
            mode="edit"
            onSubmit={handleUpdate}
          />
        </BoxComponent>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
