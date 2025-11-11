"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPageUi() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    // Mock login logic (replace with API call)
    if (email === "test@example.com" && password === "123456") {
      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setMessage({ type: "error", text: "Invalid email or password." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

        <div className="bg-white shadow-lg rounded-2xl py-8 px-4 sm:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-600">Driver's Login</h2>

            <Image
                src={"/driver2.jpeg"}
                alt="Home Hero Image"
                width={200}
                height={200}
                className="rounded-lg my-4 mx-auto"
            />

            {message && (
            <div
                className={`mb-4 p-3 text-center rounded-md font-medium ${
                message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                }`}
            >
                {message.text}
            </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
            <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded outline-blue-700"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded outline-blue-700"
                required
            />

            <button
                type="submit"
                className="font-semibold cursor-pointer w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                Login
            </button>
            </form>

            <div className="flex justify-between mt-4 text-sm text-gray-600">

                {/* Forgot Password */}
                <button
                    onClick={() => router.push("/login/forgot-password")}
                    className="cursor-pointer underline hover:text-blue-700"
                >
                    Forgot Password?
                </button>

                {/* Registration page redirection */}
                <button
                    onClick={() => router.push("/registration")}
                    className="cursor-pointer underline hover:text-blue-700"
                >
                    Not registered? Sign Up
                </button>
            </div>

            <div onClick={() => router.push("/book")} className="text-sm text-center cursor-pointer my-6 text-gray-600 underline hover:text-blue-700">Book a Car Here!</div>
        </div>
    </div>
  );
}
