"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css"; // Estilos específicos
import BoxComponent from "@/components/BoxComponent"; // Componente de box que envolve o formulário
import FormPageEstoque from "@/components/form/FormPageEstoque"; // Formulário do estoque

export default function DetalhesEstoquePage() {
  const { id } = useParams();
  const [estoqueData, setEstoqueData] = useState(null);

  useEffect(() => {
    // Mock de dados para um item do estoque
    const mockData = {
      id,
      item: `Item ${id}`,
      quantidade: 50,
      local: "Depósito 1",
      status: "Disponível",
    };
    setEstoqueData(mockData);
  }, [id]);

  const handleUpdate = (updatedData) => {
    console.log("Atualizando item do estoque:", updatedData);
    // Aqui entraria a chamada para a API para atualizar os dados
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
