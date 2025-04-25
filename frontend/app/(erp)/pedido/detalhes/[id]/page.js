// app/pedidos/detalhes/[id]/page.js
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedido from "@/components/form/FormPagePedido";
import HistoricoSection  from '@/components/searchPage/HistoricoSection';

export default function DetalhesPedidosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pedidoData, setPedidoData] = useState(null);
  const [filial, setfilial] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // 1️⃣ Fetch do pedido
  useEffect(() => {
    fetch(`http://localhost:5000/pedido/detalhes/${id}`)
      .then(r => r.json())
      .then(setPedidoData)
      .catch(console.error);
  }, [id]);

  // 2️⃣ Fetch de filial e fornecedores
  useEffect(() => {
    fetch("http://localhost:5000/filial")
      .then(r => r.json())
      .then(json => setfilial(json.data)) 
      .catch(console.error);

    fetch("http://localhost:5000/fornecedores")
      .then(r => r.json())
      .then(json => setFornecedores(json.data))
      .catch(console.error);
  }, []);

  // 3️⃣ Submit de atualização
  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/pedido/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert("Pedido atualizado com sucesso!");
      router.push("/pedido/visualizar");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  if (!pedidoData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Pedido</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPagePedido
          data={pedidoData}
          filial={filial}
          fornecedores={fornecedores}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
      <BoxComponent className={styles.historyWrapper}>
          <HistoricoSection id_pedido={id} />
      </BoxComponent>
    </div>
  );
}
