// components/searchPage/SearchPage.js
"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { useSearch } from "../../hooks/useSearch";

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
  onSearchError,
}, ref) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(1);
  const [shouldFetch, setShouldFetch] = useState(true);

  const { data: results, totalPages, loading, error } = useSearch({
    endpoint,
    page,
    ...hookParams,
    filters: searchParams,
    onSearchError: onSearchError,
    shouldFetch: shouldFetch,
  });

  useEffect(() => {
    if (error) {
      setShouldFetch(false);
    } else {
      setShouldFetch(true);
    }
  }, [error]);

  useImperativeHandle(ref, () => ({
    resetSearch: () => {
      setShouldFetch(true);
      setSearchParams({});
      setPage(1);
    }
  }));

  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(1);
    setShouldFetch(true);
  };

  const handleDetail = (item) => {
    router.push(`${detailRoute}/${item[idField]}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setShouldFetch(true);
  };

  // ADICIONADO CONSOLE.LOG PARA DEPURAÇÃO
  console.log(`[SearchPage] Status Atual:`, { loading, error, results });

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
      
      {!loading && (
        <>
          {/* A CONDIÇÃO ABAIXO FOI CORRIGIDA. 
            Verificamos se 'results' EXISTE antes de checar seu 'length'.
            Isso previne o erro caso o hook 'useSearch' retorne 'undefined'.
          */}
          {results && results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={showFields}
              onItemClick={handleDetail}
              endpoint={endpoint}
              idField={idField}
            />
          ) : (
            // Apenas mostra "Nenhum item" se não houver erro ativo
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
});

export default SearchPage;