"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageGrupos from "@/components/form/FormPageGrupos";
import styles from "./detalhes.module.css";

export default function DetalhesGruposPage() {
  const { id } = useParams();
  const router = useRouter();

  const [grupoData, setGrupoData] = useState(null);

  // Busca o Grupo
  useEffect(() => {
    fetch(`http://localhost:5000/grupos/detalhes/${id}`)
      .then((res) => res.json())
      .then(setGrupoData)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/grupos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("grupo atualizado com sucesso!");
      router.push("/grupos/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!grupoData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Grupo</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageGrupos
          data={grupoData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
