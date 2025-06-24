'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import styles from './registrar.module.css';
import CustomAlert from '@/components/CustomAlert';

export default function RegistrarOrdemCompraPage() {
  const router = useRouter();
  const [filiais, setFiliais] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [filialSel, setFilialSel] = useState('');
  const [itens, setItens] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/filial').then(r => r.json()),
      fetch('http://localhost:5000/fornecedores').then(r => r.json())
    ]).then(([fJson, foJson]) => {
      setFiliais(fJson.data);
      setFornecedores(foJson.data);
    });
  }, []);

  useEffect(() => {
    if (!filialSel) return setPedidos([]);
    fetch(`http://localhost:5000/pedidoFilial?id_filial=${filialSel}&status=Pendente`)
      .then(r => r.json())
      .then(j => setPedidos(j.data));
  }, [filialSel]);

  const addPedido = pedido => {
    fetch(`http://localhost:5000/ordemCompra/itensPedidoFilial?id_pedido_filial=${pedido.id_pedido_filial}`)
      .then(r => r.json())
      .then(j => {
        const novos = j.data.filter(item =>
          !itens.some(i => i.id_produto === item.id_produto)
        ).map(item => ({ ...item, id_fornecedor: '', preco_unitario: '' }));
        setItens(prev => [...prev, ...novos]);
      });
  };

  const handleSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        pedidos_filial: pedidos.map(p => p.id_pedido_filial),
        itens: itens.map(i => ({
          id_produto: i.id_produto,
          id_fornecedor: i.id_fornecedor,
          quantidade: Number(i.quantidade),
          preco_unitario: Number(i.preco_unitario)
        }))
      };
      const res = await fetch('http://localhost:5000/ordemCompra/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setAlertMessage('Cadastrado com sucesso!');
      setAlertSuccess(true);
      setShowAlert(true);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  const handleClose = () => {
    setShowAlert(false);
    if (alertSuccess) router.push('/ordem-compra/visualizar');
  };

  return (
    <div className={styles.container}>
      <BoxComponent>
        <h1>Criar Ordem de Compra</h1>
        <label className={styles.label}>Filial:</label>
        <select
          className={styles.input}
          value={filialSel}
          onChange={e => {
            setFilialSel(e.target.value);
            setItens([]);
          }}
        >
          <option value="">Selecione...</option>
          {filiais.map(f => (
            <option key={f.id_filial} value={f.id_filial}>
              {f.nome_filial}
            </option>
          ))}
        </select>

        <h3>Pedidos Pendentes</h3>
        <ul>
          {pedidos.map(p =>
            <li key={p.id_pedido_filial}>
              <button onClick={() => addPedido(p)}>Pedido #{p.id_pedido_filial}</button>
            </li>
          )}
        </ul>
        <FormPageOrdemCompra
          mode="create"
          itens={itens}
          onItemChange={setItens}
          onItemRemove={id => setItens(prev => prev.filter(i => i.id_produto !== id))}
          fornecedores={fornecedores}
          filiais={filiais}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
      {showAlert && <CustomAlert message={alertMessage} onClose={handleClose} />}
    </div>
  );
}