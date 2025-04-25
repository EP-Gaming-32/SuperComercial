import { useState, useEffect } from 'react';

export function useStatus() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/statusPedido?limit=100&page=1')
      .then(r => r.json())
      .then(json => setData(json.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}