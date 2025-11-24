// app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        router.replace("/admin/dashboard");
      } else {
        // No user, redirect to login
        router.replace("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
}