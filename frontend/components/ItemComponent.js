// components/ItemComponent.js

"use client";
import React from "react";
import styles from "./ItemComponent.module.css";
import { formatCpfCnpj } from "@/utils/formatters";  // import formatter

// Função para formatar datas
const formatarData = (dataString) => {
    if (!dataString) return 'Data Inválida';
    const cleanDataString = typeof dataString === 'string'
                            ? dataString.replace(/<[^>]*>?/gm, '')
                            : dataString;
    const dataObjeto = new Date(cleanDataString);
    if (isNaN(dataObjeto.getTime())) return 'Data Inválida';
    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObjeto.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para formatar telefone
const formatTelefone = (value) => {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');
  let formattedValue = '';

  if (cleanValue.length <= 2) {
    formattedValue = `(${cleanValue}`;
  } else if (cleanValue.length <= 6) {
    formattedValue = `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2)}`;
  } else if (cleanValue.length <= 10) {
    formattedValue = `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 6)}-${cleanValue.substring(6)}`;
  } else if (cleanValue.length === 11) {
    formattedValue = `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 3)} ${cleanValue.substring(3, 7)}-${cleanValue.substring(7)}`;
  } else {
    formattedValue = `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 3)} ${cleanValue.substring(3, 7)}-${cleanValue.substring(7, 11)}`;
  }
  return formattedValue;
};

// Função para formatar moeda
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
        return 'R$ 0,00'; 
    }
    const numValue = Number(value);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue);
};

export default function ItemComponent({ item, fields, onClick, endpoint, idField }) {
    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(
            "Tem certeza que deseja inativar este item?"
        );
        if (!confirmDelete) return;

        const idValue = item[idField];
        if (!idField || idValue == null) { 
            alert("ID do item não identificado para inativação.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/${endpoint}/${idValue}`, { method: "DELETE" });
            const contentType = res.headers.get("content-type");
            if (res.ok) {
                alert(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} inativado com sucesso!`);
                window.location.reload();
            } else {
                const errorText = await res.text();
                console.error("Erro detalhado do servidor:", errorText);
                if (contentType?.includes("application/json")) {
                    const data = JSON.parse(errorText);
                    alert(data.message || "Erro ao inativar.");
                } else {
                    alert("Erro inesperado no servidor. Veja console.");
                }
            }
        } catch (err) {
            console.error("Erro na inativação:", err);
            alert("Erro na conexão com o servidor.");
        }
    };

    return (
        <div className={styles.itemBlock} onClick={() => onClick(item)}>
            {fields.map((fieldObj, index) => {
                // Suporta tanto fieldObj.value/label quanto fieldObj.render
                const label = fieldObj.label || fieldObj.value;
                let displayedValue;

                if (fieldObj.render) {
                    // Se o campo define uma função de render, usa ela (formatação customizada, ex: CNPJ/CPF)
                    displayedValue = fieldObj.render(item);
                } else {
                    // Caso padrão, extrai o valor e aplica formatações genéricas
                    const key = fieldObj.value;
                    const rawValue = item[key];
                    if (key && (key.toLowerCase().includes('cnpj') || key.toLowerCase().includes('cpf'))) {
                        displayedValue = formatCpfCnpj(rawValue);
                    } else if (key.startsWith('data_') || key.toLowerCase().includes('data')) {
                        displayedValue = formatarData(rawValue);
                    } else if (key.startsWith('telefone') || key.toLowerCase().includes('telefone')) {
                        displayedValue = formatTelefone(rawValue);
                    } else if (key.includes('valor') || key.includes('preco') || key.includes('total') || key === 'subtotal') {
                        displayedValue = formatCurrency(rawValue);
                    } else {
                        displayedValue = rawValue;
                    }
                }

                return (
                    <div key={`field-${index}`} className={styles.fieldBlock}>
                        <span className={styles.fieldLabel}>{label}:</span>
                        <span className={styles.fieldValue}>{displayedValue}</span>
                    </div>
                );
            })}

            <div className={styles.fieldBlock}>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    Inativar
                </button>
            </div>
        </div>
    );
}
