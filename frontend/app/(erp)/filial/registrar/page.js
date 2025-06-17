"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Se este CSS for de 'detalhes', considere ter um CSS específico para 'registrar'
import BoxComponent from "@/components/BoxComponent";
import FormPageFilial from "@/components/form/FormPageFilial";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarFilialPage() {
  const router = useRouter();

  const initialData = {
    id_filial: "",
    nome_filial: "",
    endereco_filial: "",
    telefone_filial: "",
    email_filial: "",
    tipo_pessoa: "", // "juridica" ou "fisica" - Verifique se 'Filial' tem esse campo
    cnpj_cpf: "",
    observacao: "",
  };

  const [filialData, setFilialData] = useState(initialData);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando filial:", updatedData);

    try {
      const res = await fetch('http://localhost:5000/filial', {
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
      setAlertMessage('Filial Cadastrada com sucesso!');
      setAlertSuccess(true); // Marca como sucesso
      setShowAlert(true);
      // router.push('/filial/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
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
      router.push('/filial/visualizar');
    }
  };
  // <<----------------------------------------------------

  // Quanto à sua pergunta sobre onCancel:
  // onCancel={() => router.back()} é o correto e preferível.
  // Isso cria uma nova função anônima que chama router.back() apenas quando o evento de click ocorre.
  // {router.back} passaria a referência da função, mas sem o `()` ela não seria executada.
  // Se fosse {router.back()}, ela seria executada imediatamente na renderização, o que não é desejado.
  // Então, mantenha como está: onCancel={() => router.back()}
  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Filial</h1>
        <FormPageFilial
          data={filialData}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}// <<--- Mantenha assim
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