"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, googleProvider, db, storage } from "../lib/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DriverRegisterPageUi() {
  const router = useRouter();

  // Password regex (8 chars minimum, must contain letters + numbers)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const [driver, setDriver] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profileImage: null as File | null,
    validIdNumber: "",
    idImage: null as File | null,
    isGoogleUser: false,
    googleUid: "",
  });

  const [preview, setPreview] = useState({
    profileImage: "",
    idImage: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Restore saved form data
  useEffect(() => {
    const saved = localStorage.getItem("driverFormData");
    if (saved) setDriver((prev) => ({ ...prev, ...JSON.parse(saved) }));
  }, []);

  // Save form data on every change
  useEffect(() => {
    const { ...rest } = driver;
    localStorage.setItem("driverFormData", JSON.stringify(rest));
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDriver((prev) => ({ ...prev, [name]: value }));

    // Password match + regex validation
    if (name === "password" || name === "confirmPassword") {
      if (!passwordRegex.test(driver.password || value)) {
        setPasswordError("Password must be at least 8 characters and include letters and numbers.");
      } else if (
        (name === "confirmPassword" && value !== driver.password) ||
        (name === "password" && driver.confirmPassword && value !== driver.confirmPassword)
      ) {
        setPasswordError("Passwords do not match!");
      } else {
        setPasswordError("");
      }
    }

    // Phone number rule
    if (name === "phone") {
      if (value.startsWith("+234") || value.startsWith("+")) {
        setPhoneError("Please do not include Country code in your phone number.");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setDriver((prev) => ({ ...prev, [name]: file }));

      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview((prev) => ({
          ...prev,
          [name]: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setDriver((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: prev.firstName || user.displayName?.split(" ")[0] || "",
        lastName: prev.lastName || user.displayName?.split(" ")[1] || "",
        googleUid: user.uid,
        isGoogleUser: true,
      }));

      setMessage({ type: "success", text: "Google sign-in successful. Continue filling the form." });
    } catch {
      setMessage({ type: "error", text: "Google sign-in failed." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driver.firstName || !driver.lastName || !driver.phone || !driver.validIdNumber) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    if (!driver.profileImage || !driver.idImage) {
      setMessage({ type: "error", text: "Profile image and ID image are required." });
      return;
    }

    let userUid = driver.googleUid;

    try {
      if (!driver.isGoogleUser) {
        // Email / password validation
        if (!driver.email || !driver.password || !driver.confirmPassword) {
          setMessage({ type: "error", text: "Email and passwords are required." });
          return;
        }

        if (!passwordRegex.test(driver.password)) {
          setMessage({ type: "error", text: "Password must be 8+ characters and include letters + numbers." });
          return;
        }

        if (driver.password !== driver.confirmPassword) {
          setMessage({ type: "error", text: "Passwords do not match." });
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, driver.email, driver.password);
        userUid = userCredential.user.uid;

        await sendEmailVerification(userCredential.user);

        setMessage({
          type: "success",
          text: "Registration successful! Please verify your email before logging in.",
        });
      }

      // Upload images
      const profileRef = ref(storage, `drivers/${userUid}/profile.jpg`);
      const idRef = ref(storage, `drivers/${userUid}/id.jpg`);

      await uploadBytes(profileRef, driver.profileImage!);
      await uploadBytes(idRef, driver.idImage!);

      const profileURL = await getDownloadURL(profileRef);
      const idURL = await getDownloadURL(idRef);

      // Save Firestore
      await setDoc(doc(db, "drivers", userUid), {
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        validIdNumber: driver.validIdNumber,
        profileImage: profileURL,
        idImage: idURL,
        createdAt: new Date(),
        verified: false,
        authMethod: driver.isGoogleUser ? "google" : "email",
      });

      localStorage.removeItem("driverFormData");
      setMessage({ type: "success", text: "Registration successful!" });

      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setMessage({ type: "error", text: "Registration failed. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2 sm:p-6">
      <div className="my-6 bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-600">
          Driver Registration
        </h2>

        {message.text && (
          <div
            className={`mb-4 p-3 text-center rounded-md font-medium ${
              message.type === "success"
                ? "bg-blue-600 text-white"
                : message.type === "error"
                ? "bg-red-600 text-white"
                : ""
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <label htmlFor="profileImage" className="cursor-pointer">
              {preview.profileImage ? (
                <img
                  src={preview.profileImage}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="bg-gray-200 text-center w-32 h-32 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
                  Choose Profile Image
                </div>
              )}
            </label>

            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <small className="text-red-500 mt-1">* Required</small>
          </div>

          {/* First + Last Names */}
          <input type="text" name="firstName" placeholder="First Name" value={driver.firstName} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
          <input type="text" name="lastName" placeholder="Last Name" value={driver.lastName} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          {/* Phone */}
          <small className="text-black bg-gray-100 p-1 rounded">
            <span className="font-bold">WhatsApp number</span> is required for easy communication
          </small>

          {phoneError && <div className="text-red-600 text-sm">{phoneError}</div>}

          <input type="tel" name="phone" placeholder="Phone Number" value={driver.phone} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          {/* ID Number */}
          <h3 className="font-semibold mt-6 mb-1">Valid ID info Required</h3>
          <input type="text" name="validIdNumber" placeholder="Valid ID Number" value={driver.validIdNumber} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          {/* ID Image */}
          <div className="border rounded p-2 bg-gray-200">
            <label className="block text-gray-700 mb-1">Valid ID Image</label>
            <input type="file" name="idImage" accept="image/*" onChange={handleFileChange} />
            {preview.idImage && <img src={preview.idImage} alt="ID Preview" className="w-32 mt-2 rounded-md" />}
          </div>

          {/* Google Sign In */}
          <div className="mt-6 mb-1 flex justify-between items-center">
            <h3 className="font-semibold">Create Login</h3>
            <button onClick={handleGoogleSignIn} type="button" className="bg-green-600 text-sm text-white rounded-md p-2 border-none">
              Sign in with Google
            </button>
          </div>

          {/* Email + Password */}
          <input type="email" name="email" placeholder="Email" value={driver.email} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          {passwordError && <div className="bg-red-600 text-white text-center py-2 rounded-md text-sm">{passwordError}</div>}

          <input type="password" name="password" placeholder="Password" value={driver.password} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          <p className="text-xs text-gray-500 -mt-1">
            Must be 8+ characters and include letters + numbers.
          </p>

          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={driver.confirmPassword} onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />

          <button type="submit" className="font-semibold w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} className="text-blue-600 font-medium hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
