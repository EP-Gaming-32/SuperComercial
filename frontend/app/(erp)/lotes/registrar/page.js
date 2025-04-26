"use client";
import { useState, useEffect } from 'react';
import { useRouter }            from 'next/navigation';
import BoxComponent             from '@/components/BoxComponent';
import FormPageLote             from '@/components/form/FormPageLote';

export default function RegistrarLote() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  useEffect(()=> {
    fetch('http://localhost:5000/produtos?limit=100')
      .then(r=>r.json()).then(j=>setProdutos(j.data));
  }, []);

  const initialData = { id_produto:'', codigo_lote:'', data_expedicao:'', data_validade:'', quantidade:'' };
  const [data, setData] = useState(initialData);

  const handleSubmit = async d => {
    const res = await fetch('http://localhost:5000/lotes',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d)});
    if (!res.ok) return alert('Erro: '+(await res.json()).message);
    alert('Lote cadastrado'); router.push('/lotes/visualizar');
  };

  return (
    <BoxComponent>
      <h1>Cadastrar Lote</h1>
      <FormPageLote
        data={data}
        produtos={produtos}
        mode="add"
        onSubmit={handleSubmit}
        onCancel={()=>router.back()}
      />
    </BoxComponent>
  );
}
