"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Reaproveitando os estilos da página de detalhes
import BoxComponent from "@/components/BoxComponent";
import FormPageStatusPedido from "@/components/form/FormPageStatusPedido";

export default function RegistrarStatusPedidoPage() {
  const router = useRouter();
  // Dados iniciais para cadastro – todos os campos começam vazios
  const initialData = {
    id_forma_pagamento: "",
    descricao: "",
  };

  const [StatusPedidoData, setStatusPedidoData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando StatusPedido:", updatedData);
    // Chamada para a API para cadastrar o produto
    try{
      const res = await fetch('http://localhost:5000/statusPedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('status de pedido Cadastrada');
      router.push('/statusPedido/visualizar');
    } catch (err){
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Forma de Pagamento</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageStatusPedido
          data={StatusPedidoData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
