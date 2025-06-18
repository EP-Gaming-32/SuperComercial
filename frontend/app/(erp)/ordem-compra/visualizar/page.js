// app/ordem-compra/page.js (ou o caminho correto do seu arquivo)
"use client";

import React, { useState, useEffect } from "react";
import SearchPage from "@/components/searchPage/SearchPage";
import BoxComponent from "@/components/BoxComponent";
import CustomAlert from "@/components/CustomAlert"; // Importar CustomAlert
import styles from "./visualizar.module.css"; // Seus estilos para esta página específica

export default function SearchPageOrdemCompra() {
  const [fornecedores, setFornecedores] = useState([]);
  const [statusOptions] = useState([
    { value: "Pendente", label: "Pendente" },
    { value: "Recebido", label: "Recebido" }, // Notei "Recebido" aqui, no Pedido era "Atendido"
    { value: "Cancelado", label: "Cancelado" },
  ]);
  const [carregando, setCarregando] = useState(true);
  const [showAlert, setShowAlert] = useState(false); // Novo estado para controlar a visibilidade do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Novo estado para a mensagem do alerta

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const resp = await fetch("http://localhost:5000/fornecedores");
        const json = await resp.json();
        setFornecedores(
          (json.data || []).map(f => ({
            value: f.id_fornecedor,
            label: f.nome_fornecedor,
          }))
        );
      } catch (err) {
        console.error("[SearchPageOrdemCompra] Erro ao carregar fornecedores", err);
      } finally {
        setCarregando(false);
      }
    }
    fetchFornecedores();
  }, []);

  // Função para lidar com erros de busca reportados pelo SearchPage/useSearch
  const handleSearchError = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Função para fechar o alerta
  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  if (carregando) return <p>Carregando filtros...</p>;

  return (
    <div className={styles.container}>
      <BoxComponent>
        <SearchPage
          title="Ordens de Compra"
          endpoint="ordemCompra"
          hookParams={{ limit: 10 }}
          filters={[
            {
              name: "id_fornecedor",
              label: "Fornecedor",
              type: "select",
              options: fornecedores,
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            {
              name: "data_ordem",
              label: "Data da Ordem",
              type: "date-mask", // <<<<< ALTERADO PARA 'date-mask'
            },
          ]}
          keywordName={null}
          keywordPlaceholder="Buscar ordem de compra"
          detailRoute="/ordem-compra/detalhes"
          idField="id_ordem_compra"
          showFields={[
            { value: "status", label: "Status" },
            { value: "data_ordem", label: "Data da Ordem" },
            { value: "data_entrega_prevista", label: "Data de Entrega" },
            { value: "valor_total", label: "Valor Total" },
          ]}
          addButtonUrl="/ordem-compra/registrar"
          addButtonLabel="Registrar Ordem"
          onSearchError={handleSearchError} // <<<<< PASSA A FUNÇÃO DE ERRO
        />
      </BoxComponent>

      {/* Renderiza o CustomAlert se showAlert for true */}
      {showAlert && (
        <CustomAlert message={alertMessage} onClose={closeAlert} />
      )}
    </div>
  );
}