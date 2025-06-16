"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect }  from 'react';
import BoxComponent             from '@/components/BoxComponent';
import FormPageLote             from '@/components/form/FormPageLote';

export default function DetalhesLote() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData]         = useState(null);
  const [produtos, setProdutos] = useState([]);

  useEffect(()=>{
    fetch(`http://localhost:5000/lotes/${id}`).then(r=>r.json()).then(setData);
    fetch('http://localhost:5000/produtos?limit=100').then(r=>r.json()).then(j=>setProdutos(j.data));
  },[id]);

  const handleUpdate = async d => {
    const res = await fetch(`http://localhost:5000/lotes/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d)});
    if (!res.ok) return alert('Erro: '+(await res.json()).message);
    alert('Lote atualizado'); router.push('/lotes/visualizar');
  };

  if (!data) return <p>Carregando...</p>;
  return (
    <BoxComponent>
      <h1>Editar Lote</h1>
      <FormPageLote
        data={data}
        produtos={produtos}
        mode="edit"
        onSubmit={handleUpdate}
        onCancel={()=>router.back()}
      />
    </BoxComponent>
  );
}
