'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from './detalhes.module.css';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';

export default function DetalhesOrdemCompraPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ordemData, setOrdemData] = useState(null);
  const [produtosFornecedores, setProdutosFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
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
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAll();
  }, [fetchAll, id]);

  const handleUpdate = async updatedData => {
    setLoading(true);
    try {
      const valor_total = updatedData.itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);
      const body = {
        id_ordem_compra: id,
        status: updatedData.status,
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
      alert('Ordem de compra atualizada com sucesso!');
      router.push('/ordemCompra/visualizar');
    } catch (err) {
      console.error(err);
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.back();

  if (loading) return <div className={styles.container}><h1>Editar Ordem de Compra</h1><p>Carregando dados...</p></div>;
  if (error) return <div className={styles.container}><h1>Editar Ordem de Compra</h1><p className={styles.error}>Erro: {error}</p><button onClick={fetchAll}>Tentar novamente</button></div>;

  const produtosOriginais = ordemData.itens.map(item => ({
    id_produto: item.id_produto,
    nome_produto: item.nome_produto,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario
  }));

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
    </div>
  );
}