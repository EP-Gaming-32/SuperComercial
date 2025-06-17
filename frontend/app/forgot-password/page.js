"use client";
import { useState } from "react";
import Head from "next/head";
import styles from "./password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MUDANÇA 1: Nova função para lidar com a alteração do e-mail
  const handleEmailChange = (e) => {
    // Atualiza o valor do e-mail
    setEmail(e.target.value);
    // Reseta o estado do botão e da mensagem, permitindo um novo envio
    setIsSubmitting(false);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      const messageType = data.type || (res.ok ? 'success' : 'error');
      setMessage({ text: data.message, type: messageType });

      if (!res.ok) {
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error("Erro:", error);
      setMessage({ text: "Erro ao conectar com o servidor.", type: "error" });
      setIsSubmitting(false);
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
                // MUDANÇA 2: O 'onChange' agora chama a nossa nova função
                onChange={handleEmailChange}
                required
                className={styles.input}
              />
              <button 
                type="submit" 
                className={styles.button}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>

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