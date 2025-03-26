"use client";
import { useState } from "react";
import FormPageProdutos from "@/components/form/FormPageProdutos"; // Form component
import BoxComponent from "@/components/BoxComponent"; // Box wrapper component
import styles from "@/app/produtos/detalhes.module.css"; // Importing the same CSS module as detalhes.module.css

export default function RegistrarProdutosPage() {
  // Initial state for the new product with 12 fields
  const [newProduct, setNewProduct] = useState({
    name: "",
    fornecedor: "",
    lote: "",
    filial: "",
    id: "",
    grupo: "",
    descricao: "",
    categoria: "",
    preco: "",
    quantidade: "",
    peso: "",
    dataValidade: "",
    marca: "",
    modelo: "",
  });

  // Callback to handle registration submission
  const handleRegister = (values) => {
    console.log("Registering product:", values);
    // Make an API call to register the product here
  };

  return (
    <div className={styles.container}> {/* Applying the same container styles from detalhes.module.css */}
      <h1>Registrar Produto</h1>
      {/* Wrap the form in the BoxComponent to manage the form's container */}
      <BoxComponent>
        <FormPageProdutos data={newProduct} mode="register" onSubmit={handleRegister} />
      </BoxComponent>
    </div>
  );
}
