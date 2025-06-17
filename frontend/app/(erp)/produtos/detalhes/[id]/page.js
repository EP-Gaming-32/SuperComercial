"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BoxComponent from "@/components/BoxComponent";
import FormPageProdutos from "@/components/form/FormPageProdutos";
import styles from "./detalhes.module.css";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesProdutosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [productData, setProductData] = useState(null);
  const [grupoData, setGrupoData] = useState([]);
  const [fornecedorData, setFornecedorData] = useState([]);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA E CARREGAMENTO ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); 
  const [loading, setLoading] = useState(true); // Controla o carregamento principal dos dados do produto
  const [error, setError] = useState(null);     // Controla erros de carregamento
  // <<---------------------------------------------------------

  useEffect(() => {
    if (!id) {
        setError("ID do produto não fornecido.");
        setLoading(false);
        return;
    }

    // Função assíncrona para buscar todos os dados necessários
    async function fetchAllData() {
        setLoading(true); // Inicia o loading
        setError(null);   // Limpa erros anteriores
        try {
            // Busca dados do produto principal
            const productRes = await fetch(`http://localhost:5000/produtos/detalhes/${id}`);
            if (!productRes.ok) {
                const errBody = await productRes.json();
                throw new Error(errBody.message || `Erro HTTP ${productRes.status} ao carregar produto.`);
            }
            const productJson = await productRes.json();
            setProductData(productJson);

            // Busca dados de grupos e fornecedores em paralelo (Promise.all)
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
            // Opcional: exibir o erro de carregamento no CustomAlert também
            // setAlertMessage("Erro ao carregar dados: " + err.message);
            // setAlertSuccess(false);
            // setShowAlert(true);
        } finally {
            setLoading(false); // Finaliza o loading
        }
    }

    fetchAllData();
  }, [id]); // Depende do ID do produto

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
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage("Produto atualizado com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push("/produtos/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
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
      router.push('/produtos/visualizar');
    }
  };
  // <<----------------------------------------------------

  // Mensagens de carregamento e erro
  if (loading) {
      return (
          <BoxComponent>
              <h1>Carregando Produto...</h1>
              <p>Aguarde enquanto carregamos os dados.</p>
          </BoxComponent>
      );
  }

  if (error) {
      return (
          <BoxComponent>
              <h1>Erro ao Carregar Produto</h1>
              <p style={{ color: 'red' }}>{error}</p>
              <button onClick={() => router.back()}>Voltar</button>
          </BoxComponent>
      );
  }

  // Se não estiver carregando e não tiver erro, mas productData ainda for null/undefined
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