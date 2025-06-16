"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";
import styles from "./detalhes.module.css";

export default function DetalhesProdutosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [productData, setProductData] = useState(null);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/produtos/detalhes/${id}`)
      .then((res) => res.json())
      .then((data) => setProductData(data))
      .catch(console.error);
  }, [id]);
  
  useEffect(() => {
    fetch("http://localhost:5000/grupos")
      .then((res) => res.json())
      .then((data) => setGrupoData(data.data || []))
      .catch(console.error);
  
    fetch("http://localhost:5000/fornecedores")
      .then((res) => res.json())
      .then((data) => setFornecedorData(data.data || []))
      .catch(console.error);
  }, []);
  

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("Produto atualizado com sucesso!");
      router.push("/produtos/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!productData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Produto</h1>
        <FormPageProdutos
          data={productData}
          grupos={grupoData}
          fornecedores={fornecedorData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
