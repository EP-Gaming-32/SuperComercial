"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageFilial from "@/components/form/FormPageFilial";
import styles from "./detalhes.module.css";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesFilialPage() {
  const { id } = useParams();
  const router = useRouter();

  const [filialData, setFilialData] = useState(null);
  const [loading, setLoading] = useState(true); // <<--- Adicionado estado de loading
  const [error, setError] = useState(null);     // <<--- Adicionado estado de erro

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  useEffect(() => {
    if (!id) {
        console.warn("DetalhesFilialPage: ID não encontrado nos parâmetros URL.");
        setLoading(false);
        setError("ID da filial não fornecido.");
        return;
    }

    setLoading(true);
    setError(null);

    async function fetchFilial() {
      try {
        const res = await fetch(`http://localhost:5000/filial/detalhes/${id}`);
        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.message || `Erro HTTP: ${res.status}`);
        }
        const data = await res.json();
        setFilialData(data);
      } catch (err) {
        console.error("DetalhesFilialPage: Erro ao carregar filial:", err);
        setError("Não foi possível carregar os dados da filial.");
        // Opcional: mostrar erro de carregamento no modal também
        // setAlertMessage("Erro ao carregar dados: " + err.message);
        // setAlertSuccess(false);
        // setShowAlert(true);
      } finally {
        setLoading(false);
      }
    }
    fetchFilial();
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/filial/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),  
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro na atualização");
      }
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage("Filial atualizada com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push("/filial/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      console.error(err);
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  // <<--- NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR ---
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal
    if (alertSuccess) { // Se o alerta foi de sucesso, então redireciona
      router.push('/filial/visualizar');
    }
  };
  // <<----------------------------------------------------

  // Mensagens de carregamento e erro
  if (loading) {
      return (
          <BoxComponent>
              <h1>Carregando Filial...</h1>
              <p>Aguarde enquanto carregamos os dados.</p>
          </BoxComponent>
      );
  }

  if (error) {
      return (
          <BoxComponent>
              <h1>Erro ao Carregar Filial</h1>
              <p style={{ color: 'red' }}>{error}</p>
              <button onClick={() => router.back()}>Voltar</button>
          </BoxComponent>
      );
  }

  if (!filialData) return <p>Filial não encontrada ou dados ausentes.</p>; // <<--- Mudado para texto mais informativo

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Filial</h1>
        <FormPageFilial
          data={filialData}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>

      {/* <<--- RENDERIZAÇÃO CONDICIONAL DO MODAL CUSTOMIZADO --- */}
      {showAlert && (
        <CustomAlert 
          message={alertMessage} 
          onClose={handleCloseAlert} 
        />
      )}
      {/* <<---------------------------------------------------- */}
    </div>
  );
}