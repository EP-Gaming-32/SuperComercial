'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchComponent from "@/components/SearchComponent";
import ShowComponent from "@/components/ShowComponent";
import PaginationComponent from "@/components/PaginationComponent";
import { usePedido } from "./usePedido";
import styles from "./SearchPageProdutos.module.css";

export default function SearchPagePedidos() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [filial, setFilial] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const { data: results, totalPages, loading, error } = usePedido({
    page: currentPage,
    limit: 10,
    filters: searchParams
  });

  useEffect(() => {
    async function fetchAuxiliares() {
      try {
        const [filialRes, fornecedoresRes] = await Promise.all([
          fetch("http://localhost:5000/filial"),
          fetch("http://localhost:5000/fornecedor")
        ]);
        const filialJson = await filialRes.json();
        const fornecedoresJson = await fornecedoresRes.json();
        setFilial(filialJson.data || []);
        setFornecedores(fornecedoresJson.data || []);
      } catch (err) {
        console.error("Erro ao carregar filiais ou fornecedores", err);
      }
    }

    fetchAuxiliares();
  }, []);

  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemClick = (item) => {
    router.push(`/pedido/detalhes/${item.id_pedido}`);
  };

  return (
    <div className={styles.searchPageContainer}>
      <SearchComponent
        keywordPlaceholder="Buscar Pedido..."
        filters={[
          {
            name: 'id_filial',
            label: 'Filial',
            type: 'select',
            options: filial,
            optionKey: 'id_filial',
            optionLabel: 'nome_filial'
          },
          {
            name: 'id_fornecedor',
            label: 'Fornecedor',
            type: 'select',
            options: fornecedores,
            optionKey: 'id_fornecedor',
            optionLabel: 'nome_fornecedor'
          },
          {
            name: 'tipo_pedido',
            label: 'Tipo de Pedido',
            type: 'select',
            options: ['compra', 'reposição'],
            optionKey: '',
            optionLabel: ''
          },
          { name: 'valor_total', label: 'Valor Total', type: 'number' },
          { name: 'observacao', label: 'Observação', type: 'text' },
          { name: 'data_pedido', label: 'Data do Pedido', type: 'date' },
        ]}
        onSearch={handleSearch}
        addButton={true}
        addButtonLabel="+"
        addButtonUrl="/pedido/registrar"
      />

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          {results.length > 0 ? (
            <ShowComponent
              data={results}
              fields={["id_pedido","nome_filial","nome_fornecedor","data_pedido","tipo_pedido", "valor_total"]}
              onItemClick={handleItemClick}
            />
          ) : (
            <p>Nenhum Pedido encontrado.</p>
          )}

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
