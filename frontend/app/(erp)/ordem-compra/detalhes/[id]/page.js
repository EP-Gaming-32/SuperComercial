'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import styles from './detalhes.module.css';

export default function EditarOrdemCompraPage() {
  const router = useRouter();
  const { id_ordem_compra } = useParams();

  const [fornecedores, setFornecedores] = useState([]);
  const [dataOrdem, setDataOrdem] = useState(null);
  const [produtosOriginais, setProdutosOriginais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Paralelizar fetch de fornecedores, dados da ordem e itens
      const [resFor, resOrdem, resItens] = await Promise.all([
        fetch('http://localhost:5000/fornecedores'),
        fetch(`http://localhost:5000/ordemCompra/${id_ordem_compra}`),
        fetch(`http://localhost:5000/ordemCompra/itens?id_ordem_compra=${id_ordem_compra}`)
      ]);

      if (!resFor.ok)   throw new Error('Falha ao carregar fornecedores');
      if (!resOrdem.ok) throw new Error('Falha ao carregar ordem de compra');
      if (!resItens.ok) throw new Error('Falha ao carregar itens da ordem');

      const [jsonFor, jsonOrdem, jsonItens] = await Promise.all([
        resFor.json(),
        resOrdem.json(),
        resItens.json()
      ]);

      // Fornecedores
      setFornecedores(jsonFor.data || []);

      // Dados da ordem
      const ordemRaw = jsonOrdem.data || jsonOrdem;
      const normalizedOrdem = {
        id_fornecedor: ordemRaw.id_fornecedor,
        data_ordem: ordemRaw.data_ordem,
        data_entrega_prevista: ordemRaw.data_entrega_prevista,
        observacao: ordemRaw.observacao,
        itens: Array.isArray(jsonItens.data)
          ? jsonItens.data.map(item => ({
              id_produto: item.id_produto,
              nome_produto: item.nome_produto,
              quantidade: item.quantidade,
              preco_fornecedor: parseFloat(item.preco_unitario) || 0
            }))
          : []
      };
      setDataOrdem(normalizedOrdem);

      // ProdutosOriginais = itens atuais para edição
      setProdutosOriginais(normalizedOrdem.itens);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, [id_ordem_compra]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdate = async (updated) => {
    setLoading(true);
    try {
      // 1) Atualizar ordem
      const res = await fetch(`http://localhost:5000/ordemCompra/${id_ordem_compra}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_fornecedor: updated.id_fornecedor,
          data_ordem: updated.data_ordem,
          data_entrega_prevista: updated.data_entrega_prevista,
          observacao: updated.observacao
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao atualizar ordem');
      }

      // 2) Atualizar itens da ordem (batch replace)
      const resItens = await fetch(`http://localhost:5000/ordemCompra/${id_ordem_compra}/itens`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.itens)
      });
      if (!resItens.ok) throw new Error('Erro ao atualizar itens');

      alert('Ordem de Compra atualizada com sucesso!');
      router.push('/ordem-compra/detalhes/' + id_ordem_compra);
    } catch (err) {
      console.error(err);
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Carregando dados...</p>;
  }
  if (error) {
    return <p className={styles.error}>Erro: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Ordem de Compra</h1>
        <FormPageOrdemCompra
          data={dataOrdem}
          fornecedores={fornecedores}
          produtosOriginais={produtosOriginais}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}