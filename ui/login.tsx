// app/login/page.tsx  (or wherever your login UI lives)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { auth, googleProvider, db } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPageUi() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Helper function to send ID token to server
  const sendTokenToServer = async (idToken: string) => {
    try {
      const response = await axios.post("/api/login", { idToken });
      console.log("Server login success:", response.data);
    } catch (error) {
      console.error("Error sending token to server:", error);
    }
  };

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

      // Check Firestore drivers collection for this uid
      const driverRef = doc(db, "drivers", user.uid);
      const driverSnap = await getDoc(driverRef);

      if (!driverSnap.exists()) {
        // Not registered as driver — sign out and show message
        await signOut(auth);
        setMessage({ type: "error", text: "You are not registered as a driver. Please register first." });
        return;
      }

      // Get Firebase ID token and send to server
      const idToken = await user.getIdToken();
      await sendTokenToServer(idToken);

      window.scrollTo({ top: 0, behavior: "smooth" });
      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      const hashId = btoa(user.uid).replace(/=/g, '');
      setTimeout(() => {
        router.push(`/driver-profile/${hashId}`);
      }, 2000);
    } catch (error: unknown) {
      console.error("Email login error:", error);
      setMessage({ type: "error", text: "Login failed, verify your credentials and try again." });
    }
  };

  // Google login - check Firestore drivers before allowing dashboard access.
  // We *must* sign in with popup to obtain the uid, then confirm `drivers/{uid}` exists.
  // If not exists, delete the auto-created auth user and show message.
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check drivers collection for this uid
      const driverRef = doc(db, "drivers", user.uid);
      const driverSnap = await getDoc(driverRef);

      if (!driverSnap.exists()) {
        // Not a registered driver → delete the auto-created Auth user (cleanup)
        try {
          await user.delete();
        } catch (delErr) {
          // deletion might fail in some edge cases; sign out anyway
          console.warn("Error deleting auto-created user:", delErr);
          try { await signOut(auth); } catch {}
        }

        setMessage({
          type: "error",
          text: "You are not registered as a driver. Please register first or contact support."
        });
        return;
      }

      // User is registered → continue login
      const idToken = await user.getIdToken();
      await sendTokenToServer(idToken);

      setMessage({ type: "success", text: `Welcome ${user.displayName}! Redirecting...` });

      const hashId = btoa(user.uid).replace(/=/g, '');
      setTimeout(() => {
        router.push(`/driver-profile/${hashId}`);
      }, 2000);
    } catch (error: unknown) {
      console.error("Google login error:", error);
      // If the popup created an Auth user then we handled deletion above.
      setMessage({ type: "error", text: "Google login failed...Please try again." });
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
          {/* Email input */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded outline-blue-700"
            required
          />

          {/* Password input with show/hide */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded outline-blue-700 pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-3 top-2.5 text-gray-600 text-sm"
            >
              {showPassword ? <i className="fa fa-eye-slash" style={{fontSize:"20px"}}></i> : <i className="fa fa-eye" style={{fontSize:"20px"}}></i>}
            </button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-around items-center gap-4">
            <button
              type="submit"
              className="font-semibold cursor-pointer w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="cursor-pointer bg-green-600 text-white w-full p-2 rounded-md hover:bg-green-700"
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
