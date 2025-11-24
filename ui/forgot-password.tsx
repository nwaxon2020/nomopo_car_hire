"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebaseConfig"; 

export default function ForgotPasswordPageUi() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
        setCurrentUserEmail(user.email || "");
      } else {
        setIsUserLoggedIn(false);
        setCurrentUserEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutAndReset = async () => {
    try {
      await signOut(auth);
      setIsUserLoggedIn(false);
      setCurrentUserEmail("");
      setMessage({ 
        type: "success", 
        text: "Logged out successfully. You can now reset your password." 
      });
    } catch (error: any) {
      setMessage({ type: "error", text: "Error logging out. Please try again." });
    }
  };

  // FIXED: Direct navigation function
  const goToLogin = () => {
    router.push("/login");
  };

  const goToDashboard = () => {
    router.push("/driver-profile");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address." });
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      
      setMessage({
        type: "success",
        text: "Password reset link sent! Check your email and follow the instructions. You will be redirected to login shortly.",
      });

      // Redirect to login page after 5 seconds
      setTimeout(() => {
        router.push("/login");
      }, 5000);

    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.code === 'auth/invalid-email') {
        setMessage({ type: "error", text: "Please enter a valid email address." });
      } else if (error.code === 'auth/user-not-found') {
        setMessage({
          type: "success", 
          text: "If an account with this email exists, you will receive a password reset link shortly. Redirecting to login..."
        });
        setTimeout(() => {
          router.push("/login");
        }, 5000);
      } else if (error.code === 'auth/too-many-requests') {
        setMessage({ 
          type: "error", 
          text: "Too many attempts. Please try again later." 
        });
      } else {
        setMessage({ 
          type: "error", 
          text: "Unable to send reset email. Please try again." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in, show the logout message
  if (isUserLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-600 mb-6">
            Already Logged In
          </h2>

          <div className="text-center space-y-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">You are currently logged in as:</p>
              <p className="text-sm mt-1">{currentUserEmail}</p>
            </div>

            <p className="text-gray-600 mb-4">
              Please log out first to reset your password.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleLogoutAndReset}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
              >
                Log Out & Reset Password
              </button>
              
              {/* FIXED: Using button with onClick instead of Link */}
              <button
                onClick={goToDashboard}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
              >
                Go to Dashboard
              </button>

              {/* FIXED: Using button with onClick instead of Link */}
              <button
                onClick={goToLogin}
                className="w-full text-gray-600 border border-gray-300 py-2 rounded hover:bg-gray-50 transition font-semibold"
              >
                Back to Login
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 p-3 text-center rounded-md font-medium ${
                  message.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal forgot password form
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
            {message.type === "success" && (
              <p className="text-sm mt-2 opacity-90">
                Redirecting to login page...
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="text-center space-y-4">
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded outline-blue-700 focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`font-semibold w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="pt-4 border-t border-gray-200">
            {/* FIXED: Using button with onClick instead of Link */}
            <button
              onClick={goToLogin}
              className="text-gray-600 hover:text-blue-700 transition font-semibold underline"
            >
              Back to Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Check your email and spam folder for the reset link.</p>
          <p className="mt-1">You will be automatically redirected to login after requesting a reset.</p>
        </div>
      </div>
    </div>
  );
}