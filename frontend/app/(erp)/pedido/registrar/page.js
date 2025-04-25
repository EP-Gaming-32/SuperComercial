// app/pedidos/registrar/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./registrar.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedido from "@/components/form/FormPagePedido";

export default function RegistrarPedidosPage() {
  const router = useRouter();

  const initialData = {
    id_filial: "",
    id_fornecedor: "",
    tipo_pedido: "",
    valor_total: "",
    observacao: ""
  };

  const [pedidoData, setPedidoData] = useState(initialData);
  const [filial, setfilial] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // 1️⃣ Fetch de filial e fornecedores
  useEffect(() => {
    fetch("http://localhost:5000/filial")
      .then(r => r.json())
      .then(json => setfilial(json.data)) // 👈 extrai apenas o array
      .catch(console.error);
  
    fetch("http://localhost:5000/fornecedores")
      .then(r => r.json())
      .then(json => setFornecedores(json.data)) // 👈 extrai apenas o array
      .catch(console.error);
  }, []);

  // 2️⃣ Submit do formulário
  const handleSubmit = async (updatedData) => {
    try {
      const res = await fetch("http://localhost:5000/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert("Pedido cadastrado com sucesso!");
      router.push("/pedido/visualizar");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Cadastrar Pedido</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPagePedido
          data={pedidoData}
          filial={filial}
          fornecedores={fornecedores}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
