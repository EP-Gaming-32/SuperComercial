'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import styles from '../../registrar/registrar.module.css'; // Reutilizando o CSS da página de registro
import BoxComponent from '@/components/BoxComponent';
import FormPageOrdemCompra from '@/components/form/FormPageOrdemCompra';
import CustomAlert from "@/components/CustomAlert";

export default function DetalhesOrdemCompraPage() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  // ✅ FUNÇÃO CORRIGIDA PARA MONTAR AS URLs COMPLETAS E CORRETAS DA API
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      if (!id) throw new Error("ID da ordem de compra não foi encontrado na URL.");

      // Busca todos os dados necessários em paralelo
      const [resOrdem, resForn, resFilial] = await Promise.all([
        fetch(`http://localhost:5000/ordemCompra/detalhes/${id}`),
        fetch('http://localhost:5000/fornecedores'),
        fetch('http://localhost:5000/filial')
      ]);

      if (!resOrdem.ok) throw new Error('Falha ao carregar os detalhes da ordem de compra.');
      
      const [ordemJson, fornJson, filialJson] = await Promise.all([
          resOrdem.json(), 
          resForn.json(), 
          resFilial.json()
      ]);
      
      setInitialData(ordemJson.data);
      setFornecedores(fornJson.data || []);
      setFiliais(filialJson.data || []);

    } catch (err) {
      console.error("Erro em fetchAll:", err);
      setAlertMessage("Erro ao carregar dados: " + err.message);
      setAlertSuccess(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAll();
    }
  }, [id, fetchAll]);

  const handleUpdate = async (updatedData) => {
    try {
        const valor_total = updatedData.itens.reduce((sum, item) => sum + (Number(item.quantidade) * Number(item.preco_unitario)), 0);
        const payload = {
            status: updatedData.status,
            id_filial: updatedData.id_filial,
            data_entrega_prevista: updatedData.data_entrega_prevista,
            observacao: updatedData.observacao,
            valor_total,
            itens: updatedData.itens
        };

        const res = await fetch(`http://localhost:5000/ordemCompra/complete/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Erro ao atualizar');
        
        setAlertMessage('Ordem de compra atualizada com sucesso!');
        setAlertSuccess(true);
        setShowAlert(true);
    } catch (err) {
        setAlertMessage("Erro: " + err.message);
        setAlertSuccess(false);
        setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertSuccess) { 
      router.push('/ordem-compra/visualizar');
    }
  };

  if (loading) return <div className={styles.container}><p>Carregando dados da ordem...</p></div>;
  if (!initialData) return <div className={styles.container}><h1>Erro</h1><p>Não foi possível carregar os dados da ordem de compra.</p><button onClick={() => router.back()} className={styles.backButton}>Voltar</button></div>;

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Ordem de Compra #{id}</h1>
        <FormPageOrdemCompra
          initialData={initialData}
          fornecedores={fornecedores}
          filiais={filiais}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
      {showAlert && (
        <CustomAlert 
          message={alertMessage} 
          onClose={handleCloseAlert} 
        />
      )}
    </div>
  );
}