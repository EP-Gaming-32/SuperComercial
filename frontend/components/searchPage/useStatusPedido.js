import { useState, useEffect } from "react";

export function useStatusPedido({ page, limit = 10, filters = {} }) {
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
          const res = await fetch(`http://localhost:5000/statusPedido?${params}`);
          if (!res.ok) throw new Error("Falha ao buscar Status de Pedido");
          const json = await res.json();
          setData(json.data);
          setTotalPages(json.totalPages);
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