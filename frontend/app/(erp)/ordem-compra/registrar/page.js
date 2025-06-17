'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import styles from './registrar.module.css';
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();
  const [filiais, setFiliais] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidosFilial, setPedidosFilial] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [produtosOriginais, setProdutosOriginais] = useState([]);

  // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
  // <<---------------------------------------------

  useEffect(() => {
    // Melhorar o tratamento de erro aqui para usar CustomAlert se o carregamento inicial falhar
    Promise.all([
      fetch('http://localhost:5000/filial').then(r => {
        if (!r.ok) throw new Error('Falha ao carregar filiais');
        return r.json();
      }),
      fetch('http://localhost:5000/fornecedores').then(r => {
        if (!r.ok) throw new Error('Falha ao carregar fornecedores');
        return r.json();
      }),
    ]).then(([filialJson, fornJson]) => {
      setFiliais(filialJson.data || []);
      setFornecedores(fornJson.data || []);
    }).catch(err => {
      console.error("[RegistrarOrdemCompra] Erro ao carregar dados iniciais:", err);
      // <<--- SUBSTITUIÇÃO DO alert() para erro no carregamento de dados ---
      setAlertMessage("Erro ao carregar dados iniciais: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    });
  }, []);

  useEffect(() => {
    if (!filialSelecionada) return;
    fetch(`http://localhost:5000/pedidoFilial?id_filial=${filialSelecionada}&status=Pendente`)
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar pedidos pendentes');
        return r.json();
      })
      .then(j => setPedidosFilial(j.data || []))
      .catch(err => {
        console.error("[RegistrarOrdemCompra] Erro ao carregar pedidos pendentes:", err);
        // <<--- SUBSTITUIÇÃO DO alert() para erro no carregamento de pedidos ---
        setAlertMessage("Erro ao carregar pedidos pendentes: " + err.message);
        setAlertSuccess(false);
        setShowAlert(true);
      });
  }, [filialSelecionada]);

  const handleSelecionarPedido = pedido => {
    if (produtosOriginais.some(p => p.id_pedido_filial === pedido.id_pedido_filial)) {
      // alert("Este pedido já foi adicionado."); // Opcional: Adicionar alerta se já foi selecionado
      setAlertMessage("Este pedido já foi adicionado.");
      setAlertSuccess(false);
      setShowAlert(true);
      return;
    }
    fetch(`http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${pedido.id_pedido_filial}`)
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar itens do pedido');
        return r.json();
      })
      .then(j => {
        setProdutosOriginais(prev => [
          ...prev,
          ...j.data.map(item => ({
            id_produto: item.id_produto,
            nome_produto: item.nome_produto,
            quantidade: item.quantidade,
            preco_fornecedor: 0
          }))
        ]);
      })
      .catch(err => {
        console.error("[RegistrarOrdemCompra] Erro ao carregar itens do pedido:", err);
        // <<--- SUBSTITUIÇÃO DO alert() para erro ao selecionar pedido ---
        setAlertMessage("Erro ao carregar itens do pedido: " + err.message);
        setAlertSuccess(false);
        setShowAlert(true);
      });
  };

  const handleSubmit = async payload => {
    try {
      const res = await fetch('http://localhost:5000/ordemCompra/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          pedidos_filial: pedidosFilial.map(p => p.id_pedido_filial)
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro desconhecido ao criar ordem");
      }

      // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
      setAlertMessage('Ordem criada e pedidos vinculados com sucesso!');
      setAlertSuccess(true);
      setShowAlert(true);
      // router.push('/ordem-compra/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
    } catch (err) {
      console.error("[RegistrarOrdemCompra] Erro no submit:", err);
      // <<--- SUBSTITUIÇÃO DO alert() para erro ---
      setAlertMessage("Erro ao criar ordem de compra: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  // <<--- NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR ---
  const handleCloseAlert = () => {
    setShowAlert(false); // Fecha o modal
    if (alertSuccess) { // Se o alerta foi de sucesso, então redireciona
      router.push('/ordem-compra/visualizar');
    }
  };
  // <<----------------------------------------------------

  return (
    <div className={styles.container}>
      <h1>Criar Ordem de Compra</h1>
      {/* Aqui não tem BoxComponent envolvendo a seleção de filial, então o estilo pode ser diferente. */}
      {/* Considere envolver esta seção em um BoxComponent para consistência visual. */}
      <label>Filial *</label>
      <select
        value={filialSelecionada}
        onChange={e => {
          setFilialSelecionada(e.target.value);
          setPedidosFilial([]);
          setProdutosOriginais([]);
        }}
        // Adicione classes CSS para estilizar este select se ele não estiver dentro de um FormPageX
        // className={styles.input} // Exemplo
      >
        <option value="">Selecione...</option>
        {filiais.map(f => (
          <option key={f.id_filial} value={f.id_filial}>
            {f.nome_filial}
          </option>
        ))}
      </select>

      {pedidosFilial.length > 0 && (
        <div className={styles.section}>
          <h3>Pedidos Pendentes</h3>
          <ul className={styles.pedidosList}>
            {pedidosFilial.map(p => (
              <li key={p.id_pedido_filial}>
                <button onClick={() => handleSelecionarPedido(p)}>
                  #{p.id_pedido_filial} — {p.data_pedido.split('T')[0]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BoxComponent className={styles.section}> {/* Esta parte já está em BoxComponent */}
        <FormPageOrdemCompra
          produtosOriginais={produtosOriginais}
          produtosFornecedores={fornecedores}
          mode="create"
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