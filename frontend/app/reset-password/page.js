"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Head from "next/head";
import styles from "./reset.module.css";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      // URL CORRIGIDA E FINAL (sem /auth)
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();

      const messageType = data.type || (res.ok ? 'success' : 'error');
      setMessage({ text: data.message, type: messageType });

      if (res.ok) {
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }

    } catch (error) {
      console.error("Erro:", error);
      setMessage({ text: "Erro ao redefinir a senha.", type: "error" });
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Redefinir Senha</title>
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.title}>
          <h1>Redefinir Senha</h1>
        </div>
        <div className={styles.container}>
          <div className={styles.box}>
            <h2 className={styles.header}>Nova Senha</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Redefinir Senha
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