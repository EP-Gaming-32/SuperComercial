"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Reaproveitando os estilos da página de detalhes
import BoxComponent from "@/components/BoxComponent";
import FormPageGrupos from "@/components/form/FormPageGrupos";

export default function RegistrarGruposPage() {
  const router = useRouter();
  // Dados iniciais para cadastro – todos os campos começam vazios
  const initialData = {
    id_grupo: "",
    nome_grupo: ""
  };

  const [grupoData, setGrupoData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando grupo:", updatedData);
    // Chamada para a API para cadastrar o produto
    try{
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
    } catch (err){
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Grupo</h1>
      <BoxComponent className={styles.formWrapper}>
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
