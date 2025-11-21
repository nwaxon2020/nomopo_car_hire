"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, googleProvider } from "../lib/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function LoginPageUi() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setMessage({ type: "error", text: "Please verify your email before logging in." });
        return;
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      setTimeout(() => router.push("/"), 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({type: "error", text: "login failed, verify your credentials and try again."});
      } else {
        setMessage({ type: "error", text: "Unknown error occured during login."});
      }
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setMessage({ type: "success", text: `Welcome ${user.displayName}! Redirecting...` });
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage({type: "error", text:  "Google login failed...Please try again."});
      } else {
        setMessage({ type: "error", text: "Unknown error occured during Google login."});
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="my-6 bg-white shadow-lg rounded-2xl py-8 px-4 sm:p-8 w-full max-w-md">
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

                <div className="mt-4 flex justify-around items-center gap-4">
                    <button
                        type="submit"
                        className="font-semibold cursor-pointer w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={handleGoogleLogin}
                        className="bg-green-600 text-white w-full p-2 rounded-md hover:bg-green-700"
                    >
                        Sign in with Google
                    </button>
                </div>
            </form>

            <div className="flex justify-between mt-4 text-sm text-gray-600">
            <button
                onClick={() => router.push("/login/forgot-password")}
                className="cursor-pointer underline hover:text-blue-700"
            >
                Forgot Password?
            </button>

            <button
                onClick={() => router.push("/registration")}
                className="cursor-pointer underline hover:text-blue-700"
            >
                Not registered? Sign Up
            </button>
            </div>

            <div
            onClick={() => router.push("/book")}
            className="text-sm text-center cursor-pointer my-6 text-gray-600 underline hover:text-blue-700"
            >
            Book a Car Here!
            </div>
        </div>
    </div>
  );
}
