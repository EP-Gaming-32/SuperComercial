"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageFormaPagamento from "@/components/form/FormFormaPagamento";

export default function RegistrarFormaPagamentoPage() {
  const router = useRouter();

  const initialData = {
    id_forma_pagamento: "",
    descricao: "",
  };

  const [FormaPagamentoData, setFormaPagamentoData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando FormaPagamento:", updatedData);

    try{
      const res = await fetch('http://localhost:5000/formaPagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Forma de Pagamento Cadastrada');
      router.push('/formaPagamento/visualizar');
    } catch (err){
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Forma de Pagamento</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageFormaPagamento
          data={FormaPagamentoData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
