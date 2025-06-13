"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PedidosByFilial() {
  const [data, setData] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [filialSelecionada, setFilialSelecionada] = useState("");

  // Buscar lista de filiais
  useEffect(() => {
    fetch("http://localhost:5000/filial?page=1&limit=100")
      .then((res) => res.json())
      .then((resposta) => {
        const lista = resposta.data.map((f) => ({
          id: f.id_filial.toString(),
          nome: f.nome_filial,
        }));
        setFiliais(lista);
        if (lista.length > 0) {
          setFilialSelecionada(lista[0].id);
        }
      })
      .catch((err) => console.error("Erro ao buscar filiais:", err));
  }, []);

  // Buscar dados de pedidos por filial
  useEffect(() => {
    if (!filialSelecionada) return;

    const fetchPedidos = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/relatorios/pedidos-filial?id=${filialSelecionada}`
        );
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const json = await response.json();

        const formatado = Array.isArray(json)
          ? json.map((item) => ({
              store: item.nome_filial,
              orders: item.total_pedidos,
            }))
          : [];

        setData(formatado);
      } catch (error) {
        console.error("Erro ao carregar dados de pedidos por filial:", error);
      }
    };

    fetchPedidos();
  }, [filialSelecionada]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Relatório de Pedidos por Loja</h3>

      <div className="mb-4">
        <label htmlFor="filialSelect" className="mr-2 font-semibold">Filial:</label>
        <select
          id="filialSelect"
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {filiais.map((filial) => (
            <option key={filial.id} value={filial.id}>
              {filial.nome}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="orders" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
