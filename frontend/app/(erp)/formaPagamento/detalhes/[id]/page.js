"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageFormaPagamento from "@/components/form/FormFormaPagamento";
import styles from "./detalhes.module.css";

export default function DetalhesFormaPagamentoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [FormaPagamentoData, setFormaPagamentoData] = useState(null);


  useEffect(() => {
    fetch(`http://localhost:5000/formaPagamento/detalhes/${id}`)
      .then((res) => res.json())
      .then(setFormaPagamentoData)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/formaPagamento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro na atualização");
      }
      alert("Forma de Pagamento atualizado com sucesso!");
      router.push("/formaPagamento/visualizar");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!FormaPagamentoData) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1>Editar FormaPagamento</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageFormaPagamento
          data={FormaPagamentoData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
