// components/BackComponent.js
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./BackButton.module.css";

export default function BackComponent() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className={styles.backButton}>
      Back
    </button>
  );
}
