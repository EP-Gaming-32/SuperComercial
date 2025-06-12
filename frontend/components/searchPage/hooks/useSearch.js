import { useState, useEffect } from "react";

/**
 * Generic paginated search hook with filters.
 */
export function useSearch({ endpoint, page, limit = 10, filters = {} }) {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.debug(`[useSearch] Fetching: ${endpoint}?page=${page}&limit=${limit}&filters=${JSON.stringify(filters)}`);
      try {
        const params = new URLSearchParams({ page, limit, ...filters }).toString();
        const res = await fetch(`http://localhost:5000/${endpoint}?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
        const json = await res.json();
        setData(json.data);
        setTotalPages(json.totalPages);
        console.debug('[useSearch] Received:', json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useSearch] Error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [endpoint, page, limit, JSON.stringify(filters)]);

  return { data, totalPages, loading, error };
}