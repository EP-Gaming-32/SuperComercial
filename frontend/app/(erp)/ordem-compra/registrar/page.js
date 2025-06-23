'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import styles from './registrar.module.css';
import CustomAlert from "@/components/CustomAlert";

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();
  const [filiais, setFiliais] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidosFilial, setPedidosFilial] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [produtosDaOrdem, setProdutosDaOrdem] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/filial').then(r => r.json()),
      fetch('http://localhost:5000/fornecedores').then(r => r.json()),
    ]).then(([filialJson, fornJson]) => {
      setFiliais(filialJson.data || []);
      setFornecedores(fornJson.data || []);
    }).catch(err => {
      setAlertMessage("Erro ao carregar dados iniciais: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    });
  }, []);

  useEffect(() => {
    if (!filialSelecionada) {
      setPedidosFilial([]);
      return;
    }
    fetch(`http://localhost:5000/pedidoFilial?id_filial=${filialSelecionada}&status=Pendente`)
      .then(r => r.json())
      .then(j => setPedidosFilial(j.data || []))
      .catch(err => {
        setAlertMessage("Erro ao carregar pedidos pendentes: " + err.message);
        setAlertSuccess(false);
        setShowAlert(true);
      });
  }, [filialSelecionada]);

  const handleSelecionarPedido = (pedido) => {
    fetch(`http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${pedido.id_pedido_filial}`)
      .then(r => r.json())
      .then(j => {
        const produtosDoPedido = j.data.map(item => ({
          ...item,
          id_fornecedor: item.id_fornecedor || '',
          preco_unitario: item.preco_unitario || 0
        }));

        const novosProdutos = produtosDoPedido.filter(
          itemAPI => !produtosDaOrdem.some(itemLocal => itemLocal.id_produto === itemAPI.id_produto)
        );

        if (novosProdutos.length === 0 && j.data.length > 0) {
            setAlertMessage("Todos os itens deste pedido já foram adicionados.");
            setAlertSuccess(false);
            setShowAlert(true);
            return;
        }

        setProdutosDaOrdem(prev => [...prev, ...novosProdutos]);
      })
      .catch(err => {
        setAlertMessage("Erro ao carregar itens do pedido: " + err.message);
        setAlertSuccess(false);
        setShowAlert(true);
      });
  };

  const handleRemoverItem = (id_produto_a_remover) => {
    setProdutosDaOrdem(prev => prev.filter(p => p.id_produto !== id_produto_a_remover));
  };
  
  // ✅ CORREÇÃO FINAL: Preenchendo a lógica para enviar os dados ao backend
  const handleSubmit = async (payload) => {
    try {
      const res = await fetch('http://localhost:5000/ordemCompra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Falha ao cadastrar a ordem de compra.');
      }

      setAlertMessage("Ordem de Compra cadastrada com sucesso!");
      setAlertSuccess(true);
      setShowAlert(true);
      // O redirecionamento acontecerá no handleCloseAlert

    } catch (err) {
      setAlertMessage("Erro: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertSuccess) {
      router.push('/ordem-compra/visualizar');
    }
  };

  return (
    <div className={styles.container}>
      <BoxComponent>
        <h1>Criar Ordem de Compra</h1>
        <div className={styles.formGrid}>
          <div className={styles.filialSection}>
            <label className={styles.label}>Filial *</label>
            <select
              value={filialSelecionada}
              onChange={e => {
                setFilialSelecionada(e.target.value);
                setProdutosDaOrdem([]);
              }}
              className={styles.input}
            >
              <option value="">Selecione...</option>
              {filiais.map(f => (
                <option key={f.id_filial} value={f.id_filial}>
                  {f.nome_filial}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.pedidosSection}>
            <h3 className={styles.subTitle}>Pedidos Pendentes da Filial</h3>
            {pedidosFilial.length > 0 ? (
              <ul className={styles.pedidosList}>
                {pedidosFilial.map(p => (
                  <li key={p.id_pedido_filial}>
                    <button onClick={() => handleSelecionarPedido(p)}>
                      Pedido #{p.id_pedido_filial} — {new Date(p.data_pedido).toLocaleDateString()}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>
                {filialSelecionada ? 'Nenhum pedido pendente.' : 'Selecione uma filial.'}
              </p>
            )}
          </div>
          <div className={styles.mainFormSection}>
            <FormPageOrdemCompra
              itens={produtosDaOrdem}
              onItemChange={setProdutosDaOrdem}
              onItemRemove={handleRemoverItem}
              fornecedores={fornecedores}
              filiais={filiais}
              mode="create"
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </BoxComponent>
      {showAlert && (
        <CustomAlert 
          message={alertMessage} 
          onClose={handleCloseAlert} 
        />
      )}
    </div>
  );
}