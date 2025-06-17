"use client"; // Mantenha isso, pois usamos hooks de cliente

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Importe useParams
import BoxComponent from "@/components/BoxComponent";
import FormPageFornecedor from "@/components/form/FormPageFornecedor";
import styles from "./detalhes.module.css";
import CustomAlert from "@/components/CustomAlert"; // <<--- Importe o componente CustomAlert

export default function DetalhesFornecedorPage() {
    const router = useRouter();
    const { id } = useParams(); // Obtém o ID do fornecedor da URL

    // <<--- CORREÇÃO DO TYPO: de 'fornecedoreData' para 'fornecedorData' ---
    const [fornecedorData, setFornecedorData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // <<--- NOVOS ESTADOS PARA O MODAL DE ALERTA ---
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSuccess, setAlertSuccess] = useState(false); // Para saber se é sucesso ou erro
    // <<---------------------------------------------

    useEffect(() => {
        if (!id) {
            console.warn("DetalhesFornecedorPage: ID não encontrado nos parâmetros URL.");
            setLoading(false);
            setError("ID do fornecedor não fornecido.");
            return;
        }
        
        setLoading(true); 
        setError(null);    

        async function fetchFornecedor() {
            try {
                const res = await fetch(`http://localhost:5000/fornecedores/detalhes/${id}`); // Confirmed this URL previously

                if (!res.ok) {
                    const errorBody = await res.json();
                    throw new Error(errorBody.message || `Erro HTTP: ${res.status}`);
                }

                const data = await res.json();
                console.log("DetalhesFornecedorPage: Dados recebidos da API:", data);
                setFornecedorData(data); // <<--- Usando 'fornecedorData' correto
            } catch (err) {
                console.error("DetalhesFornecedorPage: Erro ao carregar fornecedor:", err);
                setError("Não foi possível carregar os dados do fornecedor.");
                // Opcional: mostrar erro de carregamento no modal também
                // setAlertMessage("Erro ao carregar dados: " + err.message);
                // setAlertSuccess(false);
                // setShowAlert(true);
            } finally {
                setLoading(false);
            }
        }

        fetchFornecedor();
    }, [id]);

    const handleUpdateSubmit = async (updatedData) => {
        console.log("Atualizando fornecedor:", updatedData);
        try {
            const res = await fetch(`http://localhost:5000/fornecedores/${id}`, {
                method: 'PUT', // Ou 'PATCH' dependendo da sua API
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Erro desconhecido ao atualizar.");
            }

            // <<--- SUBSTITUIÇÃO DO alert() para sucesso ---
            setAlertMessage('Fornecedor atualizado com sucesso!');
            setAlertSuccess(true); // Marca como sucesso
            setShowAlert(true);
            // router.push('/fornecedores/visualizar'); // <<--- REMOVIDO DAQUI, SERÁ FEITO APÓS FECHAR O MODAL
        } catch (err) {
            console.error("EditarFornecedorPage: Erro ao atualizar:", err);
            // <<--- SUBSTITUIÇÃO DO alert() para erro ---
            setAlertMessage("Erro ao atualizar: " + err.message);
            setAlertSuccess(false); // Marca como erro
            setShowAlert(true);
        }
    };

    // <<--- NOVA FUNÇÃO PARA FECHAR O MODAL E REDIRECIONAR ---
    const handleCloseAlert = () => {
        setShowAlert(false); // Fecha o modal
        if (alertSuccess) { // Se o alerta foi de sucesso, então redireciona
            router.push('/fornecedores/visualizar');
        }
    };
    // <<----------------------------------------------------

    if (loading) {
        return (
            <BoxComponent>
                <h1>Carregando Fornecedor...</h1>
                <p>Aguarde enquanto carregamos os dados.</p>
            </BoxComponent>
        );
    }

    if (error) {
        return (
            <BoxComponent>
                <h1>Erro ao Carregar Fornecedor</h1>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={() => router.back()}>Voltar</button>
            </BoxComponent>
        );
    }

    if (!fornecedorData) { // <<--- Usando 'fornecedorData' correto
        return (
            <BoxComponent>
                <h1>Fornecedor Não Encontrado</h1>
                <p>O fornecedor com o ID {id} não foi encontrado.</p>
                <button onClick={() => router.back()}>Voltar</button>
            </BoxComponent>
        );
    }

    return (
        <div className={styles.container} style={{ overflow: 'hidden' }}>
            <BoxComponent className={styles.formWrapper}>
                <h1>Editar Fornecedor</h1>
                <FormPageFornecedor
                    data={fornecedorData} // <<--- Usando 'fornecedorData' correto
                    mode="edit" 
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => router.back()}
                />
            </BoxComponent>

            {/* <<--- RENDERIZAÇÃO CONDICIONAL DO MODAL CUSTOMIZADO --- */}
            {showAlert && (
                <CustomAlert 
                    message={alertMessage} 
                    onClose={handleCloseAlert} 
                />
            )}
            {/* <<---------------------------------------------------- */}
        </div>
    );
}