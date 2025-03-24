'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // If no token, redirect to login
      router.push("/auth/login");
    } else {
      // Optionally decode the token to get user information or verify its validity
      // Here, you could call an API to verify the token or decode it to get user details
      const userData = JSON.parse(atob(token.split('.')[1]));  // Decode JWT (for example purposes)
      setUser(userData);
    }
  }, [router]);

  return (
    <div>
      <div>
        <h1>Dashboard</h1>
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
