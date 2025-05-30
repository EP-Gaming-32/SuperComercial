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

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("http://localhost:5000/relatorios/pedidos-filial");
        if (!response.ok) throw new Error("Erro ao buscar dados");
        const json = await response.json();

        // Transformando os dados para o formato esperado pelo gráfico
        const formatado = json.map((item) => ({
          store: item.nome_filial,
          orders: item.total_pedidos,
        }));

        setData(formatado);
      } catch (error) {
        console.error("Erro ao carregar dados de pedidos por filial:", error);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div>
      <h3>Relatório de Pedidos por Loja</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="store" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="orders" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
