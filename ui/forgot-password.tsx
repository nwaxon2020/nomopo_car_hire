"use client";

import React, { useState } from "react";
//import { sendPasswordResetEmail } from "firebase/auth";
//import { auth } from "@/firebaseConfig";

export default function ForgotPasswordPageUi() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    try {
      //await sendPasswordResetEmail(auth, email);
      setMessage({
        type: "success",
        text: "Password reset link sent! Check your email inbox.",
      });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-600 mb-6">
          Forgot Password ?
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 text-center rounded-md font-medium ${
              message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded outline-blue-700"
            required
          />

          <button
            type="submit"
            className="font-semibold w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
