'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from './detalhes.module.css';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesOrdemCompraPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ordemData, setOrdemData] = useState(null);
  const [produtosFornecedores, setProdutosFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  // NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR/TENTAR NOVAMENTE
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal

    // Se foi um sucesso (para o handleSubmit), redireciona
    if (alertSuccess) { 
      router.push('/ordem-compra/visualizar');
    } 
    // Se foi um erro de carregamento (indicado por `error` não vazio na página), oferece para tentar novamente
    else if (error) { 
      fetchAll(); // Tenta carregar os dados novamente
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(''); // Limpa o erro da página
    setAlertMessage(''); // Limpa a mensagem do modal
    setShowAlert(false); // Garante que o modal esteja fechado antes de carregar

    try {
      if (!id) {
        throw new Error("ID da ordem de compra não fornecido.");
      }

      const [resOrdem, resProdFor] = await Promise.all([
        fetch(`http://localhost:5000/ordemCompra/detalhes/${id}`),
        fetch('http://localhost:5000/ordemCompra/produtoFornecedor')
      ]);

      if (!resOrdem.ok) throw new Error('Falha ao carregar dados da ordem');
      if (!resProdFor.ok) throw new Error('Falha ao carregar produtos-fornecedor');

      const [ordemJson, prodForJson] = await Promise.all([resOrdem.json(), resProdFor.json()]);
      const pfList = (prodForJson.data || []).map(pf => ({ ...pf, preco: parseFloat(pf.preco) || 0 }));
      setProdutosFornecedores(pfList);
      
      const raw = ordemJson.data;
      const norm = {
        id_ordem: raw.id_ordem_compra,
        data_ordem: raw.data_ordem,
        data_entrega_prevista: raw.data_entrega_prevista,
        observacao: raw.observacao,
        status: raw.status,
        id_filial: raw.id_filial,
        itens: Array.isArray(raw.itens)
          ? raw.itens.map(item => ({
              id_produto: item.id_produto,
              nome_produto: item.nome_produto,
              quantidade: item.quantidade,
              preco_unitario: parseFloat(item.preco_unitario) || 0
            }))
          : []
      };
      setOrdemData(norm);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado'); // Mantém o erro na página
      // <<--- EXIBE ERRO DE CARREGAMENTO NO MODAL ---
      setAlertMessage("Erro ao carregar dados: " + (err.message || "Erro desconhecido."));
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [id, setShowAlert, setAlertMessage, setAlertSuccess, setError]); // Adicionado setShowAlert etc. como dependências do useCallback

  useEffect(() => {
    if (id) fetchAll(); // Garante que fetchAll só é chamado se o ID existir
  }, [fetchAll, id]);

  const handleUpdate = async updatedData => {
    setLoading(true); // Opcional: pode querer um loading menor para o submit
    try {
      const valor_total = updatedData.itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);
      const body = {
        id_ordem_compra: id,
        status: updatedData.status,
        id_filial: updatedData.id_filial,
        data_entrega_prevista: updatedData.data_entrega_prevista,
        valor_total,
        itens: updatedData.itens
      };
      const res = await fetch(`http://localhost:5000/ordemCompra/complete/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Erro ao atualizar ordem');
      }
      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage('Ordem de compra atualizada com sucesso!');
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push('/ordem-compra/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      console.error(err);
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.back();

  // Mensagens de carregamento e erro (renderizadas na própria página, mas o modal pode sobrepor)
  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Editar Ordem de Compra</h1>
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
        <h1>Editar Ordem de Compra</h1>
        <p className={styles.error}>Erro: {error}</p>
        <button onClick={fetchAll}>Tentar novamente</button> {/* Botão para tentar recarregar */}
        {showAlert && ( // Se o modal foi acionado por um erro de carregamento
            <CustomAlert message={alertMessage} onClose={handleCloseAlert} />
        )}
      </div>
    );
  }

  // Se não estiver carregando e não tiver erro, mas os dados não vieram (ex: ID inexistente)
  if (!ordemData) {
      return (
          <div className={styles.container}>
              <h1>Editar Ordem de Compra</h1>
              <p>Ordem de compra não encontrada.</p>
              <button onClick={() => router.back()}>Voltar</button>
          </div>
      );
  }

  // Mapeia produtosOriginais apenas se ordemData e ordemData.itens existirem
  const produtosOriginais = ordemData.itens ? ordemData.itens.map(item => ({
    id_produto: item.id_produto,
    nome_produto: item.nome_produto,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario
  })) : []; // Garante que seja um array vazio se itens for null/undefined

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Ordem de Compra</h1>
        <FormPageOrdemCompra
          id={id}
          produtosOriginais={produtosOriginais}
          produtosFornecedores={produtosFornecedores}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={handleCancel}
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