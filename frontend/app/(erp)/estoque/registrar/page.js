// app/estoque/registrar/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";
import CustomAlert from "@/components/CustomAlert";

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
    hasLote: false,
  };

  const [formData, setFormData] = useState(initial);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/produtos?limit=100").then(r => r.json()).then(j => setProdutos(j.data ?? [])),
      fetch("http://localhost:5000/fornecedores?limit=100").then(r => r.json()).then(j => setFornecedores(j.data ?? [])),
      fetch("http://localhost:5000/filial?limit=100").then(r => r.json()).then(j => setFiliais(j.data ?? [])),
    ]).catch(console.error);
  }, []);

  const handleSubmit = async (data) => {
    try {
      let id_lote = data.id_lote;
      // Se usuário marcou "Possui Lote?" mas não há id_lote, criar primeiro
      if (data.hasLote && !id_lote) {
        const loteRes = await fetch("http://localhost:5000/lotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_produto: data.id_produto,
            codigo_lote: data.codigo_lote,
            data_expedicao: data.data_expedicao,
            data_validade: data.data_validade,
            quantidade: data.lote_quantidade
          })
        });
        if (!loteRes.ok) throw new Error("Falha ao criar lote");
        const loteJson = await loteRes.json();
        id_lote = loteJson.id_lote || loteJson.data.id_lote;
      }

      // Agora criar o estoque com id_lote se existir
      const estoquePayload = { ...data, id_lote };
      const res = await fetch("http://localhost:5000/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(estoquePayload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setAlertMessage("Estoque cadastrado com sucesso!");
      setAlertSuccess(true);
    } catch (err) {
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
    } finally {
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertSuccess) router.push('/estoque/visualizar');
  };

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Estoque</h1>
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
      {showAlert && (
        <CustomAlert message={alertMessage} onClose={handleCloseAlert} />
      )}
    </div>
  );
}