"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
//import { getAuth, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
//import { doc, deleteDoc, getFirestore } from "firebase/firestore";
//import { app } from "@/firebase"; // adjust import to your firebase config

export default function DeleteAccountPageUi() {
  //const auth = getAuth(app);
  //const db = getFirestore(app);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDelete = async () => {
    //const user = auth.currentUser;
    // if (!user) {
    //   setFeedback("⚠️ No active user session found.");
    //   return;
    // }

    if (!password) {
      setFeedback("⚠️ Please enter your password to confirm.");
      return;
    }

    try {
      setLoading(true);
      // Reauthenticate user
      //const credential = EmailAuthProvider.credential(user.email!, password);
      //await reauthenticateWithCredential(user, credential);

      // Delete from Firestore (optional)
      //await deleteDoc(doc(db, "users", user.uid));

      // Delete from Firebase Auth
      //await deleteUser(user);

      setFeedback("✅ Account deleted successfully.");
      setLoading(false);

      // Redirect to login
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setFeedback("❌ " + (error.message || "Failed to delete account"));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-3 text-center">Delete Account</h1>
      <p className="text-gray-600 text-center mb-5">
        Deleting your account will permanently remove your profile, cars, and all data associated with it.
      </p>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg text-center ${
          feedback.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {feedback}
        </div>
      )}

      <input
        type="password"
        placeholder="Confirm your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="outline-blue-700 border p-2 rounded w-full mb-4"
      />

      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700"
      >
        {loading ? "Deleting..." : "Confirm Delete Account"}
      </button>

      <button
        onClick={() => router.push("/driver-profile/656")}
        className="w-full mt-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}
