"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedidoFilial from "@/components/form/FormPagePedidoFilial";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesPedidosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pedidoData, setPedidoData] = useState(null);
  const [filiais, setFiliais] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Este erro será usado para a página, mas também no modal

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  // NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR/TENTAR NOVAMENTE
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal

    // Se foi um sucesso, redireciona
    if (alertSuccess) { 
      router.push('/pedido/visualizar');
    } 
    // Se foi um erro de carregamento (indicado por `error` não vazio), oferece para tentar novamente
    else if (error) { 
      fetchAll(); // Tenta carregar os dados novamente
    }
  };


  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(""); // Limpa o erro da página
    setAlertMessage(""); // Limpa a mensagem do modal
    setShowAlert(false); // Garante que o modal esteja fechado antes de carregar

    try {
      if (!id) {
        throw new Error("ID do pedido não fornecido.");
      }

      // Dispara as três requisições em paralelo
      const [resPedido, resFiliais, resProdutos] = await Promise.all([
        fetch(`http://localhost:5000/pedidoFilial/detalhes/${id}`),
        fetch("http://localhost:5000/filial"),
        fetch("http://localhost:5000/produtos")
      ]);

      if (!resPedido.ok)     throw new Error("Falha ao carregar dados do pedido");
      if (!resFiliais.ok)    throw new Error("Falha ao carregar filiais");
      if (!resProdutos.ok)   throw new Error("Falha ao carregar produtos");

      // Converte tudo para JSON
      const [pedidoJson, filiaisJson, produtosJson] = await Promise.all([
        resPedido.json(),
        resFiliais.json(),
        resProdutos.json()
      ]);

      // Normaliza produtos gerais (garante número)
      const prods = (produtosJson.data || produtosJson || []).map(p => ({
        ...p,
        valor_produto: parseFloat(p.valor_produto) || 0
      }));
      setProdutos(prods);

      // Normaliza dados do pedido, inclusive produtoPedido
      const rawPedido = pedidoJson.data || pedidoJson;
      const normalizedPedido = {
        ...rawPedido,
        produtos: Array.isArray(rawPedido.produtos)
          ? rawPedido.produtos.map(p => ({
              ...p,
              valor_produto: parseFloat(p.valor_produto) || 0
            }))
          : []
      };
      setPedidoData(normalizedPedido);

      // Filiais
      setFiliais(filiaisJson.data || filiaisJson || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro inesperado"); // Mantém o erro na página
      // <<--- EXIBE ERRO DE CARREGAMENTO NO MODAL ---
      setAlertMessage("Erro ao carregar dados: " + (err.message || "Erro desconhecido."));
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [id, setShowAlert, setAlertMessage, setAlertSuccess, setError]); // Adicionado setShowAlert etc. como dependências do useCallback

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdate = async (updatedData) => {
    setLoading(true); // Opcional: pode querer um loading menor para o submit, sem tela cheia
    try {
      const res = await fetch(`http://localhost:5000/pedidoFilial/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar pedido");
      }
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage("Pedido atualizado com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push("/pedido/visualizar"); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      console.error(err);
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false); // Finaliza o loading do submit
    }
  };

  // Mensagens de carregamento e erro (renderizadas na própria página, mas o modal pode sobrepor)
  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Editar Pedido de Reposição</h1>
        <p>Carregando dados...</p>
        {showAlert && ( // Se o modal foi acionado por um erro de carregamento
            <CustomAlert message={alertMessage} onClose={handleCloseAlert} />
        )}
      </div>
    );
  }

  // Se houver erro de carregamento (e não estiver mais carregando), exibe a mensagem na página e o modal
  if (error) {
    return (
      <div className={styles.container}>
        <h1>Editar Pedido de Reposição</h1>
        <p className={styles.error}>Erro: {error}</p>
        <button onClick={fetchAll}>Tentar novamente</button> {/* Botão para tentar recarregar */}
        {showAlert && ( // Se o modal foi acionado por um erro de carregamento
            <CustomAlert message={alertMessage} onClose={handleCloseAlert} />
        )}
      </div>
    );
  }

  // Se não estiver carregando e não tiver erro, mas os dados não vieram (ex: ID inexistente)
  if (!pedidoData) {
      return (
          <div className={styles.container}>
              <h1>Editar Pedido de Reposição</h1>
              <p>Pedido não encontrado.</p>
              <button onClick={() => router.back()}>Voltar</button>
          </div>
      );
  }

  return (
    <div className={styles.container}>
      
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Pedido de Reposição</h1>
        <FormPagePedidoFilial
          data={pedidoData}
          filial={filiais}
          produtos={produtos}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>

      {/* <<--- RENDERIZAÇÃO CONDICIONAL DO MODAL CUSTOMIZADO --- */}
      {/* Fora do BoxComponent para garantir que sobreponha tudo */}
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