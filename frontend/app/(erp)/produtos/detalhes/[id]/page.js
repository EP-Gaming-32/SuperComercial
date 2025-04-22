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

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:5000/produtos/detalhes/${id}`);
        if (!res.ok) throw new Error("Erro ao visualizar produto");
        const json = await res.json();
        setProductData(json);
      } catch (err) {
        console.error(err);
      }
    }
    if (id) fetchProduct();
  }, [id]);

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
      <h1>Editar Produto</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageProdutos
          data={productData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
