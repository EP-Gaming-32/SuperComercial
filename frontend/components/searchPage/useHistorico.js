import { useEffect, useState } from "react";

export function useHistorico(id_pedido) {
  const [data, setData] = useState([]); // <- começa com array vazio
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id_pedido) return;
    setLoading(true);
    fetch(`http://localhost:5000/historicoPedido/${id_pedido}`)
      .then(res => res.json())
      .then(res => setData(res.data || [])) // <- extrai o array da resposta
      .catch((err) => {
        console.error("Erro ao carregar histórico:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [id_pedido]);

  return { data, loading };
}
