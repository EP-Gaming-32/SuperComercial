"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageFilial from "@/components/form/FormPageFilial";
import styles from "./detalhes.module.css";

export default function DetalhesFilialPage() {
  const { id } = useParams();
  const router = useRouter();

  const [filialData, setFilialData] = useState(null);

  // Busca o Filial
  useEffect(() => {
    fetch(`http://localhost:5000/filial/detalhes/${id}`)
      .then((res) => res.json())
      .then(setFilialData)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/filial/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("filial atualizado com sucesso!");
      router.push("/filial/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!filialData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Filial</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageFilial
          data={filialData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
