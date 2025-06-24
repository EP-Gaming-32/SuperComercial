'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from './detalhes.module.css';
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import CustomAlert from '@/components/CustomAlert';

export default function DetalhesOrdemCompraPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [resOrdem, resForn, resFilial] = await Promise.all([
        fetch(`http://localhost:5000/ordemCompra/detalhes/${id}`),
        fetch('http://localhost:5000/fornecedores'),
        fetch('http://localhost:5000/filial')
      ]);

      if (!resOrdem.ok) throw new Error('Erro ao buscar detalhes da ordem.');
      if (!resForn.ok)  throw new Error('Erro ao buscar fornecedores.');
      if (!resFilial.ok) throw new Error('Erro ao buscar filiais.');

      const [ordemJson, fornJson, filialJson] = await Promise.all([
        resOrdem.json(),
        resForn.json(),
        resFilial.json()
      ]);

      const o = ordemJson.data;
      // Converte preco_unitario de decimal (ex: 14.00) para centavos (1400)
      const itensComCentavos = o.itens.map(it => ({
        ...it,
        preco_unitario: Math.round(Number(it.preco_unitario) * 100)
      }));

      const formData = {
        data_ordem: o.data_ordem.split('T')[0],
        status: o.status,
        data_entrega_prevista: o.data_entrega_prevista.split('T')[0],
        observacao: o.observacao,
        id_filial: o.id_filial || ''
      };

      setInitialData({ ...formData, itens: itensComCentavos });
      setFornecedores(fornJson.data || []);
      setFiliais(filialJson.data || []);
    } catch (err) {
      console.error(err);
      setAlertMessage(err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAll();
  }, [id, fetchAll]);

  const handleUpdate = async payload => {
    try {
      const res = await fetch(`http://localhost:5000/ordemCompra/complete/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setAlertMessage('Atualizado com sucesso!');
      setAlertSuccess(true);
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setAlertMessage(err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    }
  };

  const handleClose = () => {
    setShowAlert(false);
    if (alertSuccess) router.push('/ordem-compra/visualizar');
  };

  if (loading) return <p>Carregando dados da ordem...</p>;
  if (!initialData) return <p>Erro ao carregar os detalhes da ordem.</p>;

  return (
    <div className={styles.container}>
      <BoxComponent>
        <h1>Editar Ordem #{id}</h1>
        <FormPageOrdemCompra
          mode="edit"
          initialData={initialData}
          fornecedores={fornecedores}
          filiais={filiais}
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={handleClose}
        />
      )}
    </div>
  );
}