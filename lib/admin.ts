// lib/adminUtils.ts
import { setDoc, doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";

export const createAdminUser = async (email: string, password: string) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add to admins collection
    await setDoc(doc(db, "admins", user.uid), {
      email: email,
      isAdmin: true,
      createdAt: new Date()
    });

    console.log("Admin user created successfully");
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return { success: false, error: error.message };
  }
};

// Function to check if user is admin
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", userId));
    return adminDoc.exists() && adminDoc.data().isAdmin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};