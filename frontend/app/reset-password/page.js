"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import styles from "./reset.module.css"; // Import the CSS module

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Erro:", error);
      setMessage("Erro ao redefinir a senha");
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
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
