'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BoxComponent from '@/components/BoxComponent';
import FormPageMovimentacao from '@/components/form/FormPageMovimentacao';

export default function DetalhesMovimentacaoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [filiais, setFiliais]   = useState([]);


  useEffect(() => {
    fetch(`http://localhost:5000/movimentacoes/${id}`)
      .then(r => r.json())
      .then(data => setFormData({ ...data }))
      .catch(console.error);
  }, [id]);


  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/produtos?limit=100').then(r => r.json()),
      fetch('http://localhost:5000/filial?limit=100').then(r => r.json())
    ]).then(([pJ, fJ]) => {
      setProdutos(pJ.data || []);
      setFiliais(fJ.data || []);
    }).catch(console.error);
  }, []);

  const handleUpdate = async data => {
    const res = await fetch(`http://localhost:5000/movimentacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json(); alert('Erro: ' + err.message);
    } else {
      alert('Movimentação atualizada!');
      router.push('/movimentacoes');
    }
  };

  if (!formData) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Editar Movimentação</h1>
      <BoxComponent>
        <FormPageMovimentacao
          data={formData}
          produtos={produtos}
          filiais={filiais}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}