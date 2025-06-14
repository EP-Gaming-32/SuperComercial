// frontend/hooks/useChartData.js
import { useState, useEffect, useCallback } from "react";

// Função auxiliar para buscar filiais
export const fetchFiliais = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
    // O endpoint /api/filial espera page e limit, mesmo que queiramos todos
    // Vamos solicitar um limite grande o suficiente para pegar todas ou a maioria das filiais.
    // Ou, se houver um endpoint /api/filial/all sem paginação, seria melhor usar ele.
    const url = `${baseUrl}/filial?page=1&limit=100`; // Solicitando 100 filiais na primeira página

    console.log(`[fetchFiliais] Buscando lista de filiais de: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro ao carregar filiais: ${response.statusText} (${response.status})`);
    }
    const result = await response.json(); // result agora é { data: [filiais], page, limit, ... }

    // Corrigido: Acessar a propriedade 'data' do objeto retornado pelo backend
    if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Formato de dados de filiais inválido do backend.");
    }

    return result.data.map(f => ({ id: f.id_filial, nome: f.nome_filial }));

  } catch (error) {
    console.error("Erro ao buscar lista de filiais:", error);
    throw error;
  }
};


const useChartData = (endpoint, initialParams = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
      let url = `${baseUrl}${endpoint}`;

      const queryParams = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      }
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      console.log(`[useChartData] Buscando dados de: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro na requisição: ${response.statusText} (${response.status})`);
      }
      const result = await response.json();
      setData(result);
      console.log("[useChartData] Dados recebidos:", result);
      console.log("[useChartData] Tipo de dados recebidos:", typeof result);
      console.log("[useChartData] É array (do backend)?", Array.isArray(result));

    } catch (err) {
      setError(err);
      setData(null);
      console.error("[useChartData] Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, setParams };
};

export default useChartData;
  