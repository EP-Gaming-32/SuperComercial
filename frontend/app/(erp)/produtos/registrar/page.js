"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Reaproveitando os estilos da página de detalhes
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";

export default function RegistrarProdutosPage() {
  const router = useRouter();
  // Dados iniciais para cadastro – todos os campos começam vazios
  const initialData = {
    sku: "",
    nome_produto: "",
    id_grupo: "",         // vai virar select
    valor_produto: "",    // number
    prazo_validade: "",   // number
    unidade_medida: "",   // text/select
    codigo_barras: "",
    id_fornecedor: "",    // select
    preco_compra: "",     // number
    prazo_entrega: "",    // number
    condicoes_pagamento: ""
  };

  const [productData, setProductData] = useState(initialData);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/grupos").then(res => res.json()).then(setGrupoData);

    fetch("http://localhost:5000/fornecedores").then(res => res.json()).then(setFornecedorData);
    
  }, []);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando produto:", updatedData);
    // Chamada para a API para cadastrar o produto
    try{
      const res = await fetch('http://localhost:5000/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Produto Cadastrado');
      router.push('/produtos');
    } catch (err){
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Produto</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageProdutos
          data={productData}
          grupos={grupoData}
          fornecedores={fornecedorData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
