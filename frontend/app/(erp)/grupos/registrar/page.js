"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageGrupos from "@/components/form/FormPageGrupos";

export default function RegistrarGruposPage() {
  const router = useRouter();

  const initialData = {
    id_grupo: "",
    nome_grupo: ""
  };

  const [grupoData, setGrupoData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando grupo:", updatedData);

    try {
      const res = await fetch('http://localhost:5000/grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Grupo Cadastrado');
      router.push('/grupos/visualizar');
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>

      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Grupo</h1>
        <FormPageGrupos
          data={grupoData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
