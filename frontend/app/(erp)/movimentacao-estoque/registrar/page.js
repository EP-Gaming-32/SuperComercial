'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BoxComponent from '@/components/BoxComponent';
import FormPageMovimentacao from '@/components/form/FormPageMovimentacao';

export default function RegistrarMovimentacaoPage() {
  const router = useRouter();
  const initialData = { id_produto: '', id_filial: '', tipo_movimentacao: '', quantidade: '' };

  const [formData, setFormData] = useState(initialData);
  const [produtos, setProdutos] = useState([]);
  const [filiais, setFiliais]   = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/produtos?limit=100').then(r => r.json()),
      fetch('http://localhost:5000/filial?limit=100').then(r => r.json())
    ]).then(([pJ, fJ]) => {
      setProdutos(pJ.data || []);
      setFiliais(fJ.data || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async data => {
    const res = await fetch('http://localhost:5000/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json(); alert('Erro: ' + err.message);
    } else {
      alert('Movimentação registrada!');
      router.push('/movimentacoes');
    }
  };

  return (
    <div>
      <h1>Cadastrar Movimentação</h1>
      <BoxComponent>
        <FormPageMovimentacao
          data={formData}
          produtos={produtos}
          filiais={filiais}
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}