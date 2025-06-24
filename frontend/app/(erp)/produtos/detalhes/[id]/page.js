"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";
import styles from "./detalhes.module.css";
import CustomAlert from "@/components/CustomAlert";

export default function DetalhesProdutosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [productData, setProductData] = useState(null);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("ID do produto não fornecido.");
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      setLoading(true);
      setError(null);
      try {
        const productRes = await fetch(`http://localhost:5000/produtos/detalhes/${id}`);
        if (!productRes.ok) {
          const errBody = await productRes.json();
          throw new Error(errBody.message || `Erro HTTP ${productRes.status} ao carregar produto.`);
        }
        const productJson = await productRes.json();
        setProductData(productJson);

        const [grupoRes, fornecedorRes] = await Promise.all([
          fetch("http://localhost:5000/grupos"),
          fetch("http://localhost:5000/fornecedores")
        ]);

        if (!grupoRes.ok) throw new Error(`Erro HTTP ${grupoRes.status} ao carregar grupos.`);
        if (!fornecedorRes.ok) throw new Error(`Erro HTTP ${fornecedorRes.status} ao carregar fornecedores.`);

        const grupoJson = await grupoRes.json();
        const fornecedorJson = await fornecedorRes.json();

        setGrupoData(grupoJson.data || []);
        setFornecedorData(fornecedorJson.data || []);
      } catch (err) {
        console.error("DetalhesProdutosPage: Erro ao carregar dados:", err);
        setError(err.message || "Não foi possível carregar os dados necessários.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro desconhecido na atualização.");
      }
      setAlertMessage("Produto atualizado com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertSuccess) {
      router.push('/produtos/visualizar');
    }
  };

  if (loading) return (
    <BoxComponent>
      <h1>Carregando Produto...</h1>
      <p>Aguarde enquanto carregamos os dados.</p>
    </BoxComponent>
  );

  if (error) return (
    <BoxComponent>
      <h1>Erro ao Carregar Produto</h1>
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => router.back()}>Voltar</button>
    </BoxComponent>
  );

  if (!productData) return <p>Produto não encontrado ou dados ausentes.</p>;

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Produto</h1>
        <FormPageProdutos
          data={productData}
          grupos={grupoData}
          fornecedores={fornecedorData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      )}
    </div>
  );
}