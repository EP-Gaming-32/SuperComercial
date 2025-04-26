import { useState, useEffect } from "react";

export function useMovimentacoes({ page, limit = 10, filters = {} }) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page, limit, ...filters });
        const res = await fetch(`http://localhost:5000/movimentacoes?${params}`);
        if (!res.ok) throw new Error("Falha ao buscar movimentações");
        const json = await res.json();
        // Normalize para ShowComponent: cada item precisa de `id`
        const items = (json.data || []).map(item => ({
          ...item,
          id: item.id_movimentacao
        }));
        setData(items);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, limit, JSON.stringify(filters)]);

  return { data, totalPages, loading, error };
}