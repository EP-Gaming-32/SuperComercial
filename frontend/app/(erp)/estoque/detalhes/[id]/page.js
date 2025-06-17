"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageEstoqueLote from "@/components/form/FormPageEstoqueLote";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesEstoquePage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA E CARREGAMENTO ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); 
  const [loading, setLoading] = useState(true); // Controla o carregamento principal dos dados do produto
  const [error, setError] = useState(null);     // Controla erros de carregamento
  // <<---------------------------------------------------------

  useEffect(() => {
    if (!id) {
        setError("ID do estoque não fornecido.");
        setLoading(false);
        return;
    }

    // Função assíncrona para buscar todos os dados necessários
    async function fetchAllData() {
        setLoading(true); // Inicia o loading
        setError(null);   // Limpa erros anteriores
        try {
            // Busca dados do estoque principal e outros dados em paralelo
            const [estoqueRes, produtosRes, fornecedoresRes, filiaisRes] = await Promise.all([
                fetch(`http://localhost:5000/estoque/${id}`),
                fetch("http://localhost:5000/produtos?limit=100"),
                fetch("http://localhost:5000/fornecedores?limit=100"),
                fetch("http://localhost:5000/filial?limit=100")
            ]);

            if (!estoqueRes.ok) throw new Error(`Erro HTTP ${estoqueRes.status} ao carregar estoque.`);
            if (!produtosRes.ok) throw new Error(`Erro HTTP ${produtosRes.status} ao carregar produtos.`);
            if (!fornecedoresRes.ok) throw new Error(`Erro HTTP ${fornecedoresRes.status} ao carregar fornecedores.`);
            if (!filiaisRes.ok) throw new Error(`Erro HTTP ${filiaisRes.status} ao carregar filiais.`);

            const [estoqueJson, produtosJson, fornecedoresJson, filiaisJson] = await Promise.all([
                estoqueRes.json(),
                produtosRes.json(),
                fornecedoresRes.json(),
                filiaisRes.json()
            ]);

            setFormData(estoqueJson.data ?? estoqueJson); // Ajuste conforme a estrutura de resposta da API
            setProdutos(produtosJson.data ?? []);
            setFornecedores(fornecedoresJson.data ?? []);
            setFiliais(filiaisJson.data ?? []);

        } catch (err) {
            console.error("DetalhesEstoquePage: Erro ao carregar dados:", err);
            setError(err.message || "Não foi possível carregar os dados necessários.");
            // Opcional: exibir o erro de carregamento no CustomAlert também
            // setAlertMessage("Erro ao carregar dados: " + err.message);
            // setAlertSuccess(false);
            // setShowAlert(true);
        } finally {
            setLoading(false); // Finaliza o loading
        }
    }

    fetchAllData();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      const res = await fetch(`http://localhost:5000/estoque/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro desconhecido na atualização.");
      }
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage("Estoque atualizado com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push("/estoque/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
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
      router.push('/estoque/visualizar');
    }
  };
  // <<----------------------------------------------------

  // Mensagens de carregamento e erro
  if (loading) {
      return (
          <BoxComponent>
              <h1>Carregando Estoque...</h1>
              <p>Aguarde enquanto carregamos os dados.</p>
          </BoxComponent>
      );
  }

  if (error) {
      return (
          <BoxComponent>
              <h1>Erro ao Carregar Estoque</h1>
              <p style={{ color: 'red' }}>{error}</p>
              <button onClick={() => router.back()}>Voltar</button>
          </BoxComponent>
      );
  }

  // Se não estiver carregando e não tiver erro, mas productData ainda for null/undefined
  if (!formData) return <p>Estoque não encontrado ou dados ausentes.</p>; 

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