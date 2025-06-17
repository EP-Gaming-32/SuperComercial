"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Se este CSS for de 'detalhes', considere ter um CSS específico para 'registrar'
import BoxComponent from "@/components/BoxComponent";
import FormPageGrupos from "@/components/form/FormPageGrupos";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarGruposPage() {
  const router = useRouter();

  const initialData = {
    id_grupo: "",
    nome_grupo: ""
  };

  const [grupoData, setGrupoData] = useState(initialData);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando grupo:", updatedData);

    try {
      const res = await fetch('http://localhost:5000/grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro desconhecido ao cadastrar.");
      }

      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage('Grupo Cadastrado com sucesso!');
      setAlertSuccess(true); // Marca como sucesso
      setShowAlert(true);
      // router.push('/grupos/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false); // Marca como erro
      setShowAlert(true);
    }
  };

  // <<--- NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR ---
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal
    if (alertSuccess) { // Se o alerta foi de sucesso, então redireciona
      router.push('/grupos/visualizar');
    }
  };
  // <<----------------------------------------------------

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>

      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Grupo</h1>
        <FormPageGrupos
          data={grupoData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}// '() => router.back()' é o correto
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