"use client";
import { useState } from "react";
import Head from "next/head";
import styles from "./password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Erro:", error);
      setMessage("Erro ao enviar o e-mail de redefinição");
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
            
            {/* ALTERAÇÃO AQUI: Adicionada a classe para o formulário */}
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

            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}