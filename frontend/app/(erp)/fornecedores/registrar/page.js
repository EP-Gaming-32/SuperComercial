"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Se este CSS for de 'detalhes', considere ter um CSS específico para 'registrar'
import BoxComponent from "@/components/BoxComponent";
import FormPageFornecedor from "@/components/form/FormPageFornecedor";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarFornecedorPage() {
  const router = useRouter();

  const initialData = {
    id_fornecedor: "",
    nome_fornecedor: "",
    endereco_fornecedor: "",
    telefone_fornecedor: "",
    email_fornecedor: "",
    tipo_pessoa: "", // "juridica" ou "fisica"
    cnpj_cpf: "",
    observacao: "",
  };

  const [fornecedorData, setFornecedorData] = useState(initialData);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando fornecedor:", updatedData);

    try {
      const res = await fetch('http://localhost:5000/fornecedores', {
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
      setAlertMessage('Fornecedor Cadastrado com sucesso!');
      setAlertSuccess(true); // Marca como sucesso
      setShowAlert(true);
      // router.push('/fornecedores/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
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
      router.push('/fornecedores/visualizar');
    }
  };
  // <<----------------------------------------------------

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Fornecedor</h1>
        <FormPageFornecedor
          data={fornecedorData}
          mode="add"
          onSubmit={handleSubmit}
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