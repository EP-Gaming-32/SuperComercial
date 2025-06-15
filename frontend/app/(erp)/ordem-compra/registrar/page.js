'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import styles from './registrar.module.css';

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();
  const [filiais, setFiliais] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidosFilial, setPedidosFilial] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [produtosOriginais, setProdutosOriginais] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/filial')
      .then(r => r.json())
      .then(j => setFiliais(j.data || []));
    fetch('http://localhost:5000/fornecedores')
      .then(r => r.json())
      .then(j => setFornecedores(j.data || []));
  }, []);

  useEffect(() => {
    if (!filialSelecionada) return;
    fetch(`http://localhost:5000/pedidoFilial?id_filial=${filialSelecionada}&status=Pendente`)
      .then(r => r.json())
      .then(j => setPedidosFilial(j.data || []));
  }, [filialSelecionada]);

  const handleSelecionarPedido = pedido => {
    if (produtosOriginais.some(p => p.id_pedido_filial === pedido.id_pedido_filial)) return;
    fetch(`http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${pedido.id_pedido_filial}`)
      .then(r => r.json())
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
      if (!res.ok) throw new Error();
      alert('Ordem criada e pedidos vinculados!');
      router.push('/ordem-compra/visualizar');
    } catch (err) {
      alert('Erro ao criar ordem de compra', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Criar Ordem de Compra</h1>

        

      <BoxComponent className={styles.section}>
        <label>Filial *</label>
        <select
          value={filialSelecionada}
          onChange={e => {
            setFilialSelecionada(e.target.value);
            setPedidosFilial([]);
            setProdutosOriginais([]);
          }}
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
        <FormPageOrdemCompra
          fornecedores={fornecedores}
          produtosOriginais={produtosOriginais}
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}