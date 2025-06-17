"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Se este CSS for de 'detalhes', considere ter um CSS específico para 'registrar'
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

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
  };

  const [formData, setFormData] = useState(initial);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/produtos?limit=100")
        .then((r) => r.json())
        .then((j) => setProdutos(j.data ?? [])),

      fetch("http://localhost:5000/fornecedores")
        .then((r) => r.json())
        .then((j) => setFornecedores(j.data ?? [])),

      fetch("http://localhost:5000/filial?limit=100")
        .then((r) => r.json())
        .then((j) => setFiliais(j.data ?? [])),
    ]).catch(console.error); // Este catch genérico pode ser melhorado para setar um estado de erro
  }, []);

  const handleSubmit = async (data) => {
    const res = await fetch("http://localhost:5000/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false); // Marca como erro
      setShowAlert(true);
      return; // Retorna para não continuar após o erro
    }
    // <<--- SUBSTITUIÇÃO do alert() para sucesso ---
    setAlertMessage("Estoque cadastrado com sucesso!");
    setAlertSuccess(true); // Marca como sucesso
    setShowAlert(true);
    // router.push("/estoque/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
  };

  // <<--- NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR ---
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal
    if (alertSuccess) { // Se o alerta foi de sucesso, então redireciona
      router.push('/estoque/visualizar');
    }
  };
  // <<----------------------------------------------------

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