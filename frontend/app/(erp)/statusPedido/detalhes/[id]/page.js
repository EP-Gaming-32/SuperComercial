"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageStatusPedido from "@/components/form/FormPageStatusPedido";
import styles from "./detalhes.module.css";

export default function DetalhesStatusPedidoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [StatusPedidoData, setStatusPedidoData] = useState(null);

  // Busca o StatusPedido
  useEffect(() => {
    fetch(`http://localhost:5000/statusPedido/detalhes/${id}`)
      .then((res) => res.json())
      .then(setStatusPedidoData)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/statusPedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("Status de Pedido atualizado com sucesso!");
      router.push("/statusPedido/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!StatusPedidoData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Status de Pedido</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageStatusPedido
          data={StatusPedidoData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
