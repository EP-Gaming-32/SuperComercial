"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./registrar.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedidoFilial from "@/components/form/FormPagePedidoFilial";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarPedidoFilialPage() {
  const router = useRouter();

  const initialData = {
    id_filial: "",
    data_pedido: "",
    status: "Pendente",
    observacao: ""
  };

  const [pedidoData, setPedidoData] = useState(initialData);
  const [filial, setFilial] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar filiais
        const filialResponse = await fetch("http://localhost:5000/filial");
        const filialData = await filialResponse.json();
        setFilial(filialData.data || filialData || []);

        // Buscar produtos
        const produtosResponse = await fetch("http://localhost:5000/produtos");
        const produtosData = await produtosResponse.json();
        
        // Converter valor_produto para número
        const produtosProcessados = (produtosData.data || produtosData || []).map(produto => ({
          ...produto,
          valor_produto: parseFloat(produto.valor_produto) || 0
        }));
        
        setProdutos(produtosProcessados);

        console.log("[RegistrarPedidoFilial] Dados carregados:", { 
          filiais: filialData, 
          produtos: produtosProcessados 
        });
      } catch (err) {
        console.error("[RegistrarPedidoFilial] Erro ao carregar dados:", err);
        // <<--- SUBSTITUIÇÃO DO alert() para erro no carregamento de dados ---
        setAlertMessage("Erro ao carregar dados necessários para o formulário.");
        setAlertSuccess(false);
        setShowAlert(true);
      } finally {
        setCarregando(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (dadosCompletos) => {
    try {
      console.log("[RegistrarPedidoFilial] Enviando dados:", dadosCompletos);
      
      // Validações básicas (substituindo alert() por CustomAlert)
      if (!dadosCompletos.id_filial) {
        setAlertMessage("Por favor, selecione uma filial.");
        setAlertSuccess(false);
        setShowAlert(true);
        return;
      }
      
      if (!dadosCompletos.produtos || dadosCompletos.produtos.length === 0) {
        setAlertMessage("Por favor, adicione pelo menos um produto ao pedido.");
        setAlertSuccess(false);
        setShowAlert(true);
        return;
      }

      const res = await fetch("http://localhost:5000/pedidoFilial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosCompletos),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao cadastrar pedido");
      }

      const resultado = await res.json();
      console.log("[RegistrarPedidoFilial] Pedido cadastrado:", resultado);
      
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage("Pedido cadastrado com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push("/pedido/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      console.error("[RegistrarPedidoFilial] Erro:", err);
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
      router.push('/pedido/visualizar');
    }
  };
  // <<----------------------------------------------------

  // Mensagem de carregamento inicial
  if (carregando) {
    return (
      <div className={styles.container}>
        <h1>Cadastrar Pedido de Reposição</h1>
        <p>Carregando dados...</p>
        {showAlert && ( // Caso o erro de carregamento aconteça, o modal ainda pode ser exibido
          <CustomAlert 
            message={alertMessage} 
            onClose={handleCloseAlert} 
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Cadastrar Pedido de Reposição</h1>
      <BoxComponent className={styles.formWrapper}>
        <FormPagePedidoFilial
          data={pedidoData}
          filial={filial}
          produtos={produtos}
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