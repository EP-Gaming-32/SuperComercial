// hooks/useSearch.js
"use client";

import { useState, useEffect } from "react";

/**
 * Generic paginated search hook with filters.
 */
// Adicione 'onSearchError' e 'shouldFetch' nas props desestruturadas
export function useSearch({ endpoint, page, limit = 10, filters = {}, onSearchError, shouldFetch }) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // <<<<< MUDANÇA: Só faz o fetch se shouldFetch for true
    if (!shouldFetch) {
      setLoading(false); // Garante que o loading para se não for para fazer fetch
      return; 
    }

    // O AbortController precisa ser definido dentro do useEffect para ser acessível na função de limpeza
    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Limpa erros anteriores
      console.debug(`[useSearch] Fetching: ${endpoint}?page=${page}&limit=${limit}&filters=${JSON.stringify(filters)}`);

      try {
        const params = new URLSearchParams({ page, limit, ...filters }).toString();
        const res = await fetch(`http://localhost:5000/${endpoint}?${params}`, { signal: controller.signal });

        if (!res.ok) {
          let errorMessage = `Falha ao buscar ${endpoint}`;
          let specificDateErrorHandled = false; // Flag para saber se já tratamos o erro de data

          try {
            const errorBody = await res.json();
            if (errorBody && (errorBody.message || errorBody.error)) {
              errorMessage = errorBody.message || errorBody.error;

              // <<<<< Lógica para detectar e tratar o erro de data específica <<<<<
              if ((res.status === 400 || res.status === 422) &&
                  (errorMessage.toLowerCase().includes("data inválida") ||
                   errorMessage.toLowerCase().includes("formato de data") ||
                   errorMessage.toLowerCase().includes("inexistente"))) {
                if (onSearchError) {
                  onSearchError("Por favor, digite uma data válida (formato DD/MM/AAAA) para a busca.");
                  specificDateErrorHandled = true;
                }
              }
            }
          } catch (jsonErr) {
            console.warn('[useSearch] Não foi possível ler o corpo do erro como JSON:', jsonErr);
          }

          if (!specificDateErrorHandled) {
            throw new Error(errorMessage); // Lança o erro para o catch externo
          }
        } else {
          const json = await res.json();
          setData(json.data || []);
          setTotalPages(json.totalPages || 1);
          console.debug('[useSearch] Received:', json);
        }
      } catch (err) {
        if (err.name !== 'AbortError') { // Ignora erros de abortamento, que são intencionais
          console.error(`[useSearch] Error ao buscar ${endpoint}:`, err);
          setError(err.message); // Define o erro no estado interno do hook

          // Se onSearchError foi fornecido e o erro não foi um erro de data específica já tratado
          if (onSearchError && !err.message.includes("Por favor, digite uma data válida")) {
              onSearchError("Ocorreu um erro ao buscar os dados. Verifique sua conexão ou tente novamente.");
          }
        } else {
            console.log('[useSearch] Fetch aborted:', err.message); // Loga o abortamento
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData(); // Chama a função de busca
    
    // Retorna a função de limpeza do useEffect para abortar a requisição
    return () => controller.abort(); 
  // Adiciona 'onSearchError' e 'shouldFetch' às dependências do useEffect
  }, [endpoint, page, limit, JSON.stringify(filters), onSearchError, shouldFetch]); 

  return { data, totalPages, loading, error };
}