// frontend/hooks/useChartData.js
import { useState, useEffect, useCallback } from "react";

// Função auxiliar para buscar filiais
export const fetchFiliais = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
    // O endpoint /api/filial espera page e limit, mesmo que queiramos todos
    const url = `${baseUrl}/filial?page=1&limit=100`; // Solicitando um limite alto para pegar todas as filiais

    console.log(`[fetchFiliais] Buscando lista de filiais de: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      // Tenta parsear o erro JSON, mas não quebra se não for JSON válido (ex: 404 HTML)
      const errorData = await response.json().catch(() => null); // Retorna null se não for JSON
      throw new Error(errorData?.error || `Erro ao carregar filiais: ${response.statusText} (${response.status})`);
    }
    const result = await response.json(); // result é { data: [filiais], page, limit, ... }

    // Corrigido: Acessar a propriedade 'data' do objeto retornado pelo backend
    if (!result.data || !Array.isArray(result.data)) {
        console.error("[fetchFiliais] Formato de dados de filiais inválido do backend:", result);
        throw new Error("Formato de dados de filiais inválido do backend.");
    }

    return result.data.map(f => ({ id: f.id_filial, nome: f.nome_filial }));

  } catch (error) {
    console.error("Erro ao buscar lista de filiais:", error);
    // Retorna o erro original para ser tratado pelo componente
    throw error;
  }
};


const useChartData = (endpoint, initialParams = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Armazena o objeto Error
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null); // Limpa o erro anterior
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
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
        const errorData = await response.json().catch(() => null); // Retorna null se não for JSON
        throw new Error(errorData?.error || `Erro na requisição: ${response.statusText} (${response.status})`);
      }
      const result = await response.json();
      setData(result);
      console.log("[useChartData] Dados recebidos:", result);
      console.log("[useChartData] Tipo de dados recebidos:", typeof result);
      console.log("[useChartData] É array (do backend)?", Array.isArray(result));

    } catch (err) {
      setError(err); // Armazena o objeto Error diretamente
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
