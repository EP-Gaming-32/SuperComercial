"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageFilial from "@/components/form/FormPageFilial";

export default function RegistrarFilialPage() {
  const router = useRouter();

  const initialData = {
    id_filial: "",
    nome_filial: "",
    endereco_filial: "",
    telefone_filial: "",
    email_filial: "",
    tipo_pessoa: "", // "juridica" ou "fisica"
    cnpj_cpf: "",
    observacao: "",
  };

  const [filialData, setFilialData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando filial:", updatedData);

    try {
      const res = await fetch('http://localhost:5000/filial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Filial Cadastrada');
      router.push('/filial/visualizar');
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Filial</h1>
        <FormPageFilial
          data={filialData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
