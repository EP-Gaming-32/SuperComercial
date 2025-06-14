"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPagePedidoFilial from "@/components/form/FormPagePedidoFilial";

export default function DetalhesPedidosPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pedidoData, setPedidoData] = useState(null);
  const [filiais, setFiliais] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Dispara as três requisições em paralelo
      const [resPedido, resFiliais, resProdutos] = await Promise.all([
        fetch(`http://localhost:5000/pedidoFilial/detalhes/${id}`),
        fetch("http://localhost:5000/filial"),
        fetch("http://localhost:5000/produtos")
      ]);

      if (!resPedido.ok)     throw new Error("Falha ao carregar dados do pedido");
      if (!resFiliais.ok)    throw new Error("Falha ao carregar filiais");
      if (!resProdutos.ok)   throw new Error("Falha ao carregar produtos");

      // Converte tudo para JSON
      const [pedidoJson, filiaisJson, produtosJson] = await Promise.all([
        resPedido.json(),
        resFiliais.json(),
        resProdutos.json()
      ]);

      // Normaliza produtos gerais (garante número)
      const prods = (produtosJson.data || produtosJson || []).map(p => ({
        ...p,
        valor_produto: parseFloat(p.valor_produto) || 0
      }));
      setProdutos(prods);

      // Normaliza dados do pedido, inclusive produtoPedido
      const rawPedido = pedidoJson.data || pedidoJson;
      const normalizedPedido = {
        ...rawPedido,
        produtos: Array.isArray(rawPedido.produtos)
          ? rawPedido.produtos.map(p => ({
              ...p,
              valor_produto: parseFloat(p.valor_produto) || 0
            }))
          : []
      };
      setPedidoData(normalizedPedido);

      // Filiais
      setFiliais(filiaisJson.data || filiaisJson || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/pedidoFilial/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao atualizar pedido");
      }
      alert("Pedido atualizado com sucesso!");
      router.push("/pedido/visualizar");
    } catch (err) {
      console.error(err);
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Editar Pedido de Filial</h1>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1>Editar Pedido de Filial</h1>
        <p className={styles.error}>Erro: {error}</p>
        <button onClick={fetchAll}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Pedido de Filial</h1>
        <FormPagePedidoFilial
          data={pedidoData}
          filial={filiais}
          produtos={produtos}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}
