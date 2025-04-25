'use client';
import { useState } from 'react';
import { useStatus } from './useStatus';
import { useHistorico } from './useHistorico';
import styles from './SearchPageProdutos.module.css';

export default function HistoricoSection({ id_pedido }) {
  const { data: statusList, loading: stLoading } = useStatus();
  const { data: history, loading: hiLoading }   = useHistorico(id_pedido);
  const [novoStatus, setNovoStatus]              = useState('');
  
  const trocar = async () => {
    await fetch('http://localhost:5000/historicoPedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_pedido, id_status: novoStatus })
    });
    setNovoStatus('');
    // ideal: revalidar o hook useHistorico aqui
  };

  return (
    <div className={styles.container}>
      <h2>Histórico de Status</h2>
      {hiLoading ? <p>Carregando histórico...</p> : (
        <ul className={styles.list}>
          {history.map(h => (
            <li key={h.id_historico}>
              [{new Date(h.data_atualizacao).toLocaleString()}] → {h.nome_status}
            </li>
          ))}
        </ul>
      )}

      <h3>Alterar status</h3>
      {stLoading ? <p>Carregando status...</p> : (
        <div className={styles.form}>
          <select
            value={novoStatus}
            onChange={e => setNovoStatus(e.target.value)}
          >
            <option value="">Selecione...</option>
            {statusList.map(s => (
              <option key={s.id_status} value={s.id_status}>
                {s.descricao}
              </option>
            ))}
          </select>
          <button onClick={trocar} disabled={!novoStatus}>
            Trocar Status
          </button>
        </div>
      )}
    </div>
  );
}
