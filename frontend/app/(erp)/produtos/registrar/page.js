"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";

export default function RegistrarProdutosPage() {
  const router = useRouter();

  const initialData = {
    sku: "",
    nome_produto: "",
    id_grupo: "",         
    valor_produto: "",    
    prazo_validade: "",   
    unidade_medida: "",  
    codigo_barras: "",
    id_fornecedor: "",    
    preco_compra: "",     
    prazo_entrega: "",    
    condicoes_pagamento: "",
  };

  const [productData, setProductData] = useState(initialData);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/grupos")
      .then(r => r.json())
      .then(json => setGrupoData(json.data))
      .catch(console.error);
  
    fetch("http://localhost:5000/fornecedores")
      .then(r => r.json())
      .then(json => setFornecedorData(json.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando produto:", updatedData);

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
      router.push('/produtos/visualizar');
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
