// app/estoque/detalhes/[id]/page.js
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";
import CustomAlert from "@/components/CustomAlert";

export default function DetalhesEstoquePage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setError("ID não fornecido"); setLoading(false); return; }
    async function fetchAll() {
      setLoading(true);
      try {
        const [eRes, pRes, fRes, fiRes] = await Promise.all([
          fetch(`http://localhost:5000/estoque/${id}`),
          fetch("http://localhost:5000/produtos?limit=100"),
          fetch("http://localhost:5000/fornecedores?limit=100"),
          fetch("http://localhost:5000/filial?limit=100"),
        ]);
        if (!eRes.ok) throw new Error("Erro ao carregar estoque");
        const eJson = await eRes.json();
        const data = eJson.data ?? eJson;
        setFormData({
          ...data,
          hasLote: !!data.id_lote,
          codigo_lote: data.codigo_lote || "",
          data_expedicao: data.data_expedicao || "",
          data_validade: data.data_validade || "",
          lote_quantidade: data.lote_quantidade || "",
        });
        setProdutos((await pRes.json()).data || []);
        setFornecedores((await fRes.json()).data || []);
        setFiliais((await fiRes.json()).data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      let id_lote = data.id_lote;
      if (data.hasLote) {
        if (id_lote) {
          // atualizar lote existente
          await fetch(`http://localhost:5000/lotes/${id_lote}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codigo_lote: data.codigo_lote,
              data_expedicao: data.data_expedicao,
              data_validade: data.data_validade,
              quantidade: data.lote_quantidade
            })
          });
        } else {
          // criar lote novo
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
          const loteJson = await loteRes.json();
          id_lote = loteJson.id_lote || loteJson.data.id_lote;
        }
      } else {
        id_lote = null;
      }
      // atualizar estoque
      const payload = { ...data, id_lote };
      const res = await fetch(`http://localhost:5000/estoque/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Erro ao atualizar estoque');
      setAlertMessage('Estoque atualizado com sucesso!');
      setAlertSuccess(true);
    } catch (err) {
      setAlertMessage('Erro: ' + err.message);
      setAlertSuccess(false);
    } finally {
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertSuccess) router.push('/estoque/visualizar');
  };

  if (loading) return <BoxComponent><p>Carregando...</p></BoxComponent>;
  if (error) return <BoxComponent><p style={{color:'red'}}>{error}</p></BoxComponent>;
  if (!formData) return <p>Dados não encontrados</p>;

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Estoque</h1>
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
      {showAlert && <CustomAlert message={alertMessage} onClose={handleCloseAlert} />}
    </div>
  );
}