"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageFornecedor from "@/components/form/FormPageFornecedor";
import styles from "./detalhes.module.css";

export default function DetalhesFornecedorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [fornecedoreData, setFornecedorData] = useState(null);

  // Busca o Fornecedor
  useEffect(() => {
    fetch(`http://localhost:5000/fornecedores/detalhes/${id}`)
      .then((res) => res.json())
      .then(setFornecedorData)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/fornecedores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("fornecedore atualizado com sucesso!");
      router.push("/fornecedores/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!fornecedoreData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Fornecedor</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageFornecedor
          data={fornecedoreData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
