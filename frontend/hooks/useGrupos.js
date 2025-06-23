// frontend/hooks/useGrupos.js
import { useState, useEffect } from "react";

// Hook para buscar grupos/categorias de produtos
const useGrupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrupos = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
        const url = `${baseUrl}/grupos?page=1&limit=100`; // Buscar todos os grupos

        console.log(`[useGrupos] Buscando grupos de: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Erro ao carregar grupos: ${response.statusText} (${response.status})`);
        }
        
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          console.error("[useGrupos] Formato de dados de grupos inválido:", result);
          throw new Error("Formato de dados de grupos inválido do backend.");
        }

        // Mapear para formato padrão
        const gruposFormatados = result.data.map(g => ({
          id: g.id_grupo,
          nome: g.nome_grupo
        }));

        setGrupos(gruposFormatados);
        console.log("[useGrupos] Grupos carregados:", gruposFormatados);

      } catch (err) {
        setError(err);
        setGrupos([]);
        console.error("[useGrupos] Erro ao buscar grupos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  return { grupos, loading, error };
};

export default useGrupos;

