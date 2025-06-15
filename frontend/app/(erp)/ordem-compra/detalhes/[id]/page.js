"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import styles from "./detalhes.module.css";
import BoxComponent from "@/components/BoxComponent";
import FormPageOrdemCompra from "@/components/form/FormPageOrdemCompra";

export default function DetalhesOrdemCompraPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ordemData, setOrdemData] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtosFornecedores, setProdutosFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [resOrdem, resFornecedores, resProdFor] = await Promise.all([
        fetch(`http://localhost:5000/ordemCompra/detalhes/${id}`),
        fetch("http://localhost:5000/fornecedores"),
        fetch("http://localhost:5000/ordemCompra/produtoFornecedor")
      ]);

      if (!resOrdem.ok) throw new Error("Falha ao carregar dados da ordem");
      if (!resFornecedores.ok) throw new Error("Falha ao carregar fornecedores");
      if (!resProdFor.ok) throw new Error("Falha ao carregar produtos-fornecedor");

      const [ordemJson, fornecJson, prodForJson] = await Promise.all([
        resOrdem.json(),
        resFornecedores.json(),
        resProdFor.json()
      ]);

      // Normaliza produtos-fornecedor
      const pfList = (prodForJson.data || []).map(pf => ({
        ...pf,
        preco: parseFloat(pf.preco) || 0
      }));
      setProdutosFornecedores(pfList);

      // Normaliza dados da ordem e itens
      const raw = ordemJson.data;
      const norm = {
        ...raw,
        itens: Array.isArray(raw.itens)
          ? raw.itens.map(item => ({
              ...item,
              preco_unitario: parseFloat(item.preco_unitario) || 0
            }))
          : []
      };
      setOrdemData(norm);

      // Fornecedores
      setFornecedores(fornecJson.data || []);
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

  const handleUpdate = async updatedData => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/ordemCompra/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Erro ao atualizar ordem");
      }
      alert("Ordem de compra atualizada com sucesso!");
      router.push("/ordemCompra/visualizar");
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
        <h1>Editar Ordem de Compra</h1>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1>Editar Ordem de Compra</h1>
        <p className={styles.error}>Erro: {error}</p>
        <button onClick={fetchAll}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BoxComponent className={styles.formWrapper}>
        <h1>Editar Ordem de Compra</h1>
        {/* Exibe itens da ordem antes do formulário */}
        {ordemData.itens.length > 0 && (
          <div className={styles.itensWrapper}>
            <h2>Itens da Ordem</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {ordemData.itens.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome_produto}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.preco_unitario.toFixed(2)}</td>
                    <td>{(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <FormPageOrdemCompra
          data={ordemData}
          fornecedores={fornecedores}
          produtosFornecedores={produtosFornecedores}
          mode="edit"
          onSubmit={handleUpdate}
          onCancel={() => router.back()}
        />
      </BoxComponent>
    </div>
  );
}