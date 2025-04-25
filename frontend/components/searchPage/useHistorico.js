import { useState, useEffect } from 'react';

export function useHistorico(id_pedido) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id_pedido) return;
    setLoading(true);
    fetch(`http://localhost:5000/historicoPedido/${id_pedido}`)
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id_pedido]);

  return { data, loading, error };
}
