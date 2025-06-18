// components/searchPage/SearchPage.js
"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react"; // Adicionado forwardRef, useImperativeHandle
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent"; // Caminho do seu componente SearchComponent
import ShowComponent from "@/components/ShowComponent"; // Caminho do seu componente ShowComponent
import PaginationComponent from "@/components/PaginationComponent"; // Caminho do seu componente PaginationComponent
import { useSearch } from "../../hooks/useSearch"; // Caminho do seu hook useSearch

// Usamos forwardRef para permitir que o PedidoPage chame métodos internos de SearchPage
const SearchPage = forwardRef(function SearchPage({
  title,
  endpoint,
  hookParams = {},
  filters,
  keywordName,
  keywordPlaceholder,
  detailRoute,
  idField,
  showFields,
  addButtonUrl,
  addButtonLabel,
  onSearchError, // Recebe a nova prop do PedidoPage
}, ref) { // 'ref' recebido aqui por causa do forwardRef
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(1);
  // <<<<< NOVO ESTADO: Controla se useSearch deve fazer fetch
  const [shouldFetch, setShouldFetch] = useState(true); 

  // Modifiquei a forma como a chamada ao hook useSearch é feita
  const { data: results, totalPages, loading, error } = useSearch({
    endpoint,
    page,
    ...hookParams,
    filters: searchParams,
    onSearchError: onSearchError,
    // <<<<< NOVO: Passa o estado shouldFetch para o useSearch
    shouldFetch: shouldFetch, 
  });

  // <<<<< NOVO: useEffect para reagir ao erro e controlar shouldFetch
  useEffect(() => {
    if (error) {
      // Se houver um erro do useSearch, paramos as tentativas automáticas de fetch
      setShouldFetch(false);
      // Aqui, o onSearchError já foi chamado pelo useSearch, mostrando o alerta.
    } else {
      // Se não há erro, permite que fetches aconteçam
      setShouldFetch(true); 
    }
  }, [error]); // Depende do estado de erro do useSearch

  // <<<<< NOVO: Expõe um método para o componente pai (PedidoPage)
  useImperativeHandle(ref, () => ({
    resetSearch: () => {
      // Quando o alerta é fechado, podemos resetar o estado de busca
      setShouldFetch(true); // Permite uma nova busca
      setSearchParams({}); // Limpa os parâmetros de busca para uma "busca nova"
      setPage(1); // Volta para a primeira página
      // Opcional: Limpar o erro interno aqui também, se ele for persistente
      // setError(null);
    }
  }));

  const handleSearch = (params) => {
    console.log('[SearchPage] Parâmetros recebidos para useSearch:', params);
    setSearchParams(params);
    setPage(1); // Resetar para a primeira página em uma nova busca
    setShouldFetch(true); // <<<<< NOVO: Ao iniciar uma nova busca, permite o fetch
  };

  const handleDetail = (item) => {
    router.push(`${detailRoute}/${item[idField]}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setShouldFetch(true); // <<<<< NOVO: Ao mudar de página, permite o fetch
  };

  return (
    <div>
      {title && <h1>{title}</h1>}

      <SearchComponent
        keywordName={keywordName}
        keywordPlaceholder={keywordPlaceholder}
        filters={filters}
        onSearch={handleSearch}
        addButton
        addButtonLabel={addButtonLabel}
        addButtonUrl={addButtonUrl}
      />

      {loading && <p>Carregando...</p>}
      {/* Removemos a exibição direta do `error` aqui, pois o alerta será mostrado */}

      {!loading && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={showFields}
              onItemClick={handleDetail}
              endpoint={endpoint}
              idField={idField}
            />
          ) : (
            // <<<<< NOVO: Adiciona condição para exibir "Nenhum item" apenas se não houver erro
            !error && <p>Nenhum item encontrado.</p>
          )}

          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}); // <<<<< Fechamento do forwardRef

export default SearchPage;