// components/estoque/useEstoque.js
import { useState, useEffect } from 'react';
export function useEstoque({ page, limit=10, filters={} }) {
  const [data, setData]         = useState([]);
  const [totalPages, setTP]     = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    const qs = new URLSearchParams({ page, limit, ...filters }).toString();
    fetch(`http://localhost:5000/estoque?${qs}`)
      .then(r => r.json())
      .then(j => { setData(j.data); setTP(j.totalPages); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, limit, JSON.stringify(filters)]);

  return { data, totalPages, loading, error };
}
