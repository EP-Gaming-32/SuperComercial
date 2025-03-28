"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css"; // Estilos específicos para a página de detalhes
import BoxComponent from "@/components/BoxComponent"; // Componente de box que envolve o formulário
import FormPageProdutos from "@/components/form/FormPageProdutos"; // Formulário de produtos

export default function DetalhesProdutosPage() {
  const { id } = useParams();
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    // Dados mock com 12 campos, alinhados ao esquema atual
    const mockData = {
      id,
      name: `Produto ${id}`,
      fornecedor: "Fornecedor 1",
      lote: "Lote 1",
      filial: "Filial 1",
      grupo: "Grupo Ae",
      descricao: "Descrição do produto",
      categoria: "Categoria X",
      preco: "100.00",
      quantidade: "50",
      peso: "1.5kg",
      dataValidade: "2025-12-31",
    };
    setProductData(mockData);
  }, [id]);

  const handleUpdate = (updatedData) => {
    console.log("Atualizando produto:", updatedData);
    // Chamada para a API para atualizar os dados do produto
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Editar Produto</h1>
      {productData ? (
        <BoxComponent className={styles.formWrapper}>
          <FormPageProdutos
            data={productData}
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
