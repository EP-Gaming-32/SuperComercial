'use client';
import { useSearch } from '../../hooks/useSearch';
import styles from './detalhes.module.css';

export default function LoteSection({ id_estoque }) {
  const { data: lotes = [], loading, error } = useSearch({
    // ✅ AQUI: Garanta que o prefixo "lotes/" está incluído na string.
    endpoint: 'lotes/por-estoque',
    page: 1,
    limit: 100,
    filters: { id_estoque }
  });

  if (loading) return <p>Carregando lotes...</p>;
  if (error) return <p className={styles.error}>Erro: {error}</p>;

  // ... O resto do seu componente permanece igual ...
  return (
    <div className={styles.histContainer}>
      <h2>Lotes Vinculados</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código do Lote</th>
              <th>Data Expedição</th>
              <th>Data Validade</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(lote => (
              <tr key={lote.id_lote}>
                <td>{lote.codigo_lote}</td>
                <td>{new Date(lote.data_expedicao).toLocaleDateString()}</td>
                <td>{lote.data_validade ? new Date(lote.data_validade).toLocaleDateString() : 'N/A'}</td>
                <td>{lote.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}