// app/pedido/page.js
"use client"; // Esta linha é crucial e deve ser a primeira no arquivo

import React, { useState, useEffect, useRef } from "react"; // Adicionado useRef
import SearchPage from "@/components/searchPage/SearchPage"; // Confirme este caminho
import BoxComponent from "@/components/BoxComponent"; // Confirme este caminho
import CustomAlert from "@/components/CustomAlert"; // <<<<< CAMINHO CORRIGIDO AQUI: Removida a subpasta extra <<<<<
import styles from "./visualizar.module.css"; // Seus estilos para esta página específica

export default function PedidoPage() {
  const [filiais, setFiliais] = useState([]);
  const [statusOptions] = useState([
    { value: "Pendente", label: "Pendente" },
    { value: "Atendido", label: "Atendido" },
    { value: "Cancelado", label: "Cancelado" },
  ]);
  const [carregando, setCarregando] = useState(true);
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar a visibilidade do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Estado para a mensagem do alerta

  const searchPageRef = useRef(null); // <<<<< NOVO: Referência para o SearchPage

  useEffect(() => {
    async function fetchFilters() {
      try {
        console.log("[PedidoPage] buscando filiais");
        const filialResposta = await fetch("http://localhost:5000/filial");
        const filialData = await filialResposta.json();

        setFiliais(filialData.data || filialData || []);
        console.log("[PedidoPage] filiais: ", filialData);
      } catch (err) {
        console.error("[PedidoPage] Erro ao carregar filiais", err);
      } finally {
        setCarregando(false);
      }
    }

    fetchFilters();
  }, []);

  // Função para lidar com erros de busca reportados pelo SearchPage/useSearch
  const handleSearchError = (message) => {
    console.log('[PedidoPage] handleSearchError chamado. Mensagem:', message);
    setAlertMessage(message);
    setAlertMessage(message); // Definir a mensagem de alerta
    setShowAlert(true); // Mostrar o alerta
    console.log('[PedidoPage] showAlert após handleSearchError:', true);
  };

  // Função para fechar o alerta
  const closeAlert = () => {
    console.log('[PedidoPage] closeAlert chamado.');
    setShowAlert(false);
    setAlertMessage(""); // Limpa a mensagem do alerta
    console.log('[PedidoPage] showAlert após closeAlert:', false);

    // <<<<< NOVO: Quando o alerta é fechado, "reinicia" o SearchPage
    // para que ele não tente um novo fetch automático imediato.
    if (searchPageRef.current && searchPageRef.current.resetSearch) {
      searchPageRef.current.resetSearch();
    }
  };

  if (carregando) return <p>Carregando filtros...</p>;

  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          ref={searchPageRef} // <<<<< NOVO: Atribui a ref ao SearchPage
          title="Pedidos de Reposição"
          endpoint="pedidoFilial"
          hookParams={{ limit: 10 }}
          filters={[
            {
              name: "id_filial",
              label: "Filial",
              type: "select",
              options: filiais.map((fi) => ({
                value: fi.id_filial,
                label: fi.nome_filial,
              })),
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            {
              name: "data_pedido",
              label: "Data do Pedido",
              type: "date-mask", // Continua como 'date-mask'
            },
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar pedido"
          detailRoute="/pedido/detalhes"
          idField="id_pedido_filial"
          showFields={[
            { value: "nome_filial", label: "Filial" },
            { value: "status", label: "Status Atual" },
            { value: "data_pedido", label: "Data do Pedido" },
          ]}
          addButtonUrl="/pedido/registrar"
          addButtonLabel="Registrar Pedido"
          onSearchError={handleSearchError} // Passa a função de tratamento de erro para SearchPage
        />
      </BoxComponent>

      {/* Renderiza o CustomAlert se showAlert for true */}
      {showAlert && (
        <CustomAlert message={alertMessage} onClose={closeAlert} />
      )}
    </div>
  );
}