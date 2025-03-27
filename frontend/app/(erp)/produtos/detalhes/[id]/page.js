"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css" ; // Page-specific styles
import BoxComponent from "@/components/BoxComponent"; // The box component that wraps the form
import FormPageProdutos from "@/components/form/FormPageProdutos"; // The form component

export default function DetalhesProdutosPage() {
  const { id } = useParams();
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    // Updated mock data with 12 fields
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
      marca: "Marca Y",
      modelo: "Modelo Z",
    };
    setProductData(mockData);
  }, [id]);

  const handleUpdate = (updatedData) => {
    console.log("Updating product:", updatedData);
    // Make the API call here to update the product
  };

  return (
    <div className={styles.container}>
      <h1>Edit Product</h1>
      {productData ? (
        <BoxComponent className={styles.formWrapper}>
          <FormPageProdutos
            data={productData}
            mode="edit"
            onSubmit={handleUpdate}
          />
        </BoxComponent>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
