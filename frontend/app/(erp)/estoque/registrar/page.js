"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";

export default function RegistrarEstoquePage() {
  const router = useRouter();
  const initial = {
    id_produto: "",
    id_fornecedor: "",
    id_filial: "",
    local_armazenamento: "",
    quantidade: "",
    estoque_minimo: "",
    estoque_maximo: "",
  };

  const [formData, setFormData] = useState(initial);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/produtos?limit=100")
        .then((r) => r.json())
        .then((j) => setProdutos(j.data ?? [])),

      fetch("http://localhost:5000/fornecedores")
        .then((r) => r.json())
        .then((j) => setFornecedores(j.data ?? [])),

      fetch("http://localhost:5000/filial?limit=100")
        .then((r) => r.json())
        .then((j) => setFiliais(j.data ?? [])),
    ]).catch(console.error);
  }, []);

  const handleSubmit = async (data) => {
    const res = await fetch("http://localhost:5000/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return alert("Erro: " + err.message);
    }
    alert("Estoque cadastrado com sucesso!");
    router.push("/estoque/visualizar");
  };

  return (
    <div className={styles.container}>
      <h1>Cadastrar Estoque</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageEstoqueLote
          data={formData}
          produtos={produtos}
          fornecedores={fornecedores}
          filiais={filiais}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}