"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Reaproveitando os estilos da página de detalhes
import BoxComponent from "@/components/BoxComponent";
import FormPageFornecedor from "@/components/form/FormPageFornecedor";

export default function RegistrarFornecedorPage() {
  const router = useRouter();
  // Dados iniciais para cadastro – todos os campos começam vazios
  const initialData = {
    id_fornecedor: "",
    nome_fornecedor: "",
    endereco_fornecedor: "a",
    telefone_fornecedor: "",
    email_fornecedor: "",
    tipo_pessoa: "", // "juridica" ou "fisica"
    cnpj_cpf: "",
    observacao: "",
  };

  const [fornecedorData, setFornecedorData] = useState(initialData);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando fornecedor:", updatedData);
    // Chamada para a API para cadastrar o produto
    try{
      const res = await fetch('http://localhost:5000/fornecedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      alert('Fornecedor Cadastrado');
      router.push('/fornecedores/visualizar');
    } catch (err){
      alert("Erro: " + err.message);
    }
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <h1>Cadastrar Fornecedor</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPageFornecedor
          data={fornecedorData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}//ou só {router.back} ?
        />
      </BoxComponent>
    </div>
  );
}
