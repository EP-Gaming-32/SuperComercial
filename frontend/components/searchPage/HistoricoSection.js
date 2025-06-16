'use client';
import { useSearch } from '../../hooks/useSearch';
import styles from './detalhes.module.css';

export default function HistoricoSection({ id_pedido_filial }) {
  const { data: history = [], loading, error } = useSearch({
    endpoint: 'historicoPedidoFilial',
    page: 1,
    limit: 100,
    filters: { id_pedido_filial }
  });

  if (loading) return <p>Carregando histórico...</p>;
  if (error) return <p className={styles.error}>Erro: {error}</p>;

  return (
    <div className={styles.histContainer}>
      <h2>Histórico de Status</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data da Alteração</th>
              <th>Status Anterior</th>
              <th>Status Novo</th>
              <th>Motivo</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id_historico_pf}>
                <td>{new Date(h.data_alteracao).toLocaleString()}</td>
                <td>{h.status_antigo}</td>
                <td>{h.status_novo}</td>
                <td>{h.motivo}</td>
                <td>{h.nome_usuario || 'Sistema'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}