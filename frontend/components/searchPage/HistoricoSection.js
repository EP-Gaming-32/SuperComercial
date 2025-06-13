'use client';
import { useSearch } from './hooks/useSearch';
import styles from './detalhes.module.css';

export default function HistoricoSection({ id_pedido }) {
  // Busca histórico de status do pedido
  const { data: history = [], loading, error } = useSearch({
    endpoint: 'historicoPedido',
    page: 1,
    limit: 100,
    filters: { id_pedido }
  });

  if (loading) return <p>Carregando histórico...</p>;
  if (error)   return <p className={styles.error}>Erro: {error}</p>;

  return (
    <div className={styles.histContainer}>
      <h2>Histórico de Status</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data Atualização</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id_historico}>
                <td>{new Date(h.data_atualizacao).toLocaleString()}</td>
                <td>{h.nome_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}