"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhes.module.css"; // Se este CSS for de 'detalhes', considere ter um CSS específico para 'registrar'
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarProdutosPage() {
  const router = useRouter();

  const initialData = {
    sku: "",
    nome_produto: "",
    id_grupo: "",    
    valor_produto: "",  
    prazo_validade: "", 
    unidade_medida: "", 
    codigo_barras: "",
    id_fornecedor: "",  
    preco_compra: "",   
    prazo_entrega: "",  
    condicoes_pagamento: "",
  };

  const [productData, setProductData] = useState(initialData);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  useEffect(() => {
    fetch("http://localhost:5000/grupos")
      .then(r => r.json())
      .then(json => setGrupoData(json.data))
      .catch(console.error);
  
    fetch("http://localhost:5000/fornecedores")
      .then(r => r.json())
      .then(json => setFornecedorData(json.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (updatedData) => {
    console.log("Cadastrando produto:", updatedData);

    try{
      const res = await fetch('http://localhost:5000/produtos', {
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
      setAlertMessage('Produto Cadastrado com sucesso!');
      setAlertSuccess(true); // Marca como sucesso
      setShowAlert(true);
      // router.push('/produtos/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err){
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
      router.push('/produtos/visualizar');
    }
  };
  // <<----------------------------------------------------

  return (
    <div className={styles.container} style={{ overflow: 'hidden' }}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Cadastrar Produto</h1>
        <FormPageProdutos
          data={productData}
          grupos={grupoData}
          fornecedores={fornecedorData}
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