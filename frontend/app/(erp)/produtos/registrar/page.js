"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Reaproveitando os estilos da página de detalhes
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";

export default function RegistrarProdutosPage() {
  const router = useRouter();
  // Dados iniciais para cadastro – todos os campos começam vazios
  const initialData = {
    name: "",
    fornecedor: "",
    lote: "",
    filial: "",
    grupo: "",
    descricao: "",
    categoria: "",
    preco: "",
    quantidade: "",
    peso: "",
    dataValidade: "",
  };

  const [productData, setProductData] = useState(initialData);

  const handleSubmit = (updatedData) => {
    console.log("Cadastrando produto:", updatedData);
    // Chamada para a API para cadastrar o produto
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Produto</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageProdutos
          data={productData}
          mode="add"
          onSubmit={handleSubmit}
        />
      </BoxComponent>
    </div>
  );
}
