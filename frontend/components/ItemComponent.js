// components/ItemComponent.js

"use client";
import React from "react";
import styles from "./ItemComponent.module.css";

const formatarData = (dataString) => {
    if (!dataString) return '';
    const cleanDataString = typeof dataString === 'string' 
                            ? dataString.replace(/<[^>]*>?/gm, '') 
                            : dataString;
    const dataObjeto = new Date(cleanDataString);
    if (isNaN(dataObjeto.getTime())) {
        if (typeof cleanDataString === 'string' && cleanDataString.length === 8 && /^\d+$/.test(cleanDataString)) {
            const dia = cleanDataString.substring(0, 2);
            const mes = cleanDataString.substring(2, 4);
            const ano = cleanDataString.substring(4, 8);
            return `${dia}/${mes}/${ano}`;
        }
        return 'Data Inválida';
    }
    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0'); 
    const ano = dataObjeto.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para formatar telefone com a correção
const formatTelefone = (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, ''); 
    if (cleanValue.length === 0) return '';
    if (cleanValue.length <= 10) { 
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else { 
      // vv-- A CORREÇÃO FOI FEITA AQUI: '$g2' virou '$2' --vv
      return cleanValue
        .replace(/^(\d{2})(\d)/, '($1) $2') 
        .replace(/(\d{5})(\d{4})$/, '$1-$2');
    }
};

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
        const confirmDelete = window.confirm("Tem certeza que deseja inativar este item?");
        if (!confirmDelete) return;
        if (!idField || !item[idField]) { 
            alert("ID não identificado para inativação.");
            return;
        }
        const idValue = item[idField];
        try {
            const res = await fetch(
                `http://localhost:5000/${endpoint}/${idValue}`,
                { method: "DELETE" }
            );
            const contentType = res.headers.get("content-type");
            if (res.ok) {
                alert(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} inativado com sucesso!`);
                window.location.reload(); 
            } else {
                const errorText = await res.text();
                console.error("Erro detalhado do servidor:", errorText);
                if (contentType?.includes("application/json")) {
                    try {
                        const data = JSON.parse(errorText);
                        alert(data.message || "Erro ao inativar.");
                    } catch (jsonError) {
                        alert("Erro inesperado no servidor (JSON inválido). Veja console.");
                    }
                } else {
                    alert("Erro inesperado no servidor (não JSON). Veja console.");
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
                const key = typeof fieldObj === "string" ? fieldObj : fieldObj.value;
                const label = typeof fieldObj === "string" ? fieldObj : fieldObj.label;
                const fieldValue = item[key];
                let displayedValue = fieldValue;

                if (key === 'data_pedido' || key === 'data_ordem' || key === 'data_movimentacao') { 
                    displayedValue = formatarData(fieldValue);
                } 
                else if (key === 'telefone_fornecedor' || key === 'telefone_filial') { 
                    displayedValue = formatTelefone(fieldValue);
                }
                else if (key === 'valor_produto') { 
                    displayedValue = formatCurrency(fieldValue);
                }

                return (
                    <div
                        key={`field-${key}-${index}`}
                        className={styles.fieldBlock}
                    >
                        <span className={styles.fieldLabel}>{label}:</span>
                        <span className={styles.fieldValue}>
                            {displayedValue}
                        </span>
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