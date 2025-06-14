"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";

export default function DetalhesEstoquePage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/estoque/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Falha ao carregar o estoque");
        return res.json();
      })
      .then(json => {
        setFormData(json.data ?? json);
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao carregar estoque: " + err.message);
      });
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/produtos?limit=100")
        .then(r => r.json()).then(j => setProdutos(j.data ?? [])),
      fetch("http://localhost:5000/fornecedores?limit=100")
        .then(r => r.json()).then(j => setFornecedores(j.data ?? [])),
      fetch("http://localhost:5000/filiais?limit=100")
        .then(r => r.json()).then(j => setFiliais(j.data ?? [])),
    ]).catch(console.error);
  }, []);

  const handleUpdate = async (data) => {
    const res = await fetch(`http://localhost:5000/estoque/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return alert("Erro: " + err.message);
    }
    alert("Estoque atualizado com sucesso!");
    router.push("/estoque/visualizar");
  };

  if (!formData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar Estoque</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageEstoqueLote
          data={formData}
          produtos={produtos}
          fornecedores={fornecedores}
          filiais={filiais}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
