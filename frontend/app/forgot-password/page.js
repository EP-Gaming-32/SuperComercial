"use client";
import { useState } from "react";
import Head from "next/head";
import styles from "./password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  // MUDANÇA 1: O estado da mensagem agora é um objeto
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" }); // Limpa a mensagem anterior

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      // MUDANÇA 2: Define o texto e o tipo da mensagem
      const messageType = data.type || (res.ok ? 'success' : 'error');
      setMessage({ text: data.message, type: messageType });

    } catch (error) {
      console.error("Erro:", error);
      // MUDANÇA 3: Define uma mensagem de erro em caso de falha na comunicação
      setMessage({ text: "Erro ao conectar com o servidor.", type: "error" });
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Esqueci a Senha</title>
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <h1>Esqueci Minha Senha</h1>
        </div>
        <div className={styles.container}>
          <div className={styles.box}>
            <h2 className={styles.header}>Redefinir Senha</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Enviar Link
              </button>
            </form>

            {/* MUDANÇA 4: Aplica as classes de estilo dinamicamente */}
            {message.text && (
              <p className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}