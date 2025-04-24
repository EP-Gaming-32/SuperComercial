'use client';
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token"); // Check if token exists

    if (token) {
      // If a token exists, redirect to the dashboard
      redirect("/home");
    } else {
      // Otherwise, redirect to the login page
      redirect("/auth/login");
    }
  }, []);

  return null; // This will not render anything because of the redirect logic
}
