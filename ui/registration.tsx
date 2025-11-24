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
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=.?]{8,}$/;

  // Form state
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

  const [loading, setLoading] = useState(false);

  // Validation errors
  const [passwordError, setPasswordError] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Format phone number with Nigerian country code
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '');
    
    // Remove Nigerian country code if present
    if (cleaned.startsWith('234')) {
      cleaned = cleaned.substring(3);
    }
    
    // Limit to 10 digits (typical Nigerian phone number without country code)
    cleaned = cleaned.substring(0, 10);
    
    return cleaned;
  };

  // Get the full phone number with country code for database
  const getFullPhoneNumber = (): string => {
    const cleaned = driver.phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+234${cleaned}`;
    }
    return driver.phone;
  };

  // Restore saved form data
  useEffect(() => {
    const saved = localStorage.getItem("driverFormData");
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setDriver((prev) => ({ 
          ...prev, 
          ...parsedData,
          profileImage: null,
          idImage: null
        }));
      } catch (error) {
        console.error("Error restoring form data:", error);
      }
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required fields validation
    if (!driver.firstName.trim()) errors.firstName = "First name is required";
    if (!driver.lastName.trim()) errors.lastName = "Last name is required";
    if (!driver.phone.trim()) errors.phone = "Phone number is required";
    if (!driver.validIdNumber.trim()) errors.validIdNumber = "ID number is required";
    if (!driver.profileImage) errors.profileImage = "Profile image is required";
    if (!driver.idImage) errors.idImage = "ID image is required";

    // Phone validation
    const cleanedPhone = driver.phone.replace(/\D/g, '');
    if (driver.phone.trim()) {
      if (cleanedPhone.length !== 10) {
        errors.phone = "Phone number must be 10 digits";
      } else if (!/^[0-9]{10}$/.test(cleanedPhone)) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    // Email validation for non-Google users
    if (!driver.isGoogleUser) {
      if (!driver.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) {
        errors.email = "Please enter a valid email address";
      }
      
      if (!driver.password) {
        errors.password = "Password is required";
      } else if (!passwordRegex.test(driver.password)) {
        errors.password = "Password must be 8+ characters with letters and numbers";
      }
      
      if (!driver.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (driver.password !== driver.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Format phone number as user types
      const formattedPhone = formatPhoneNumber(value);
      setDriver((prev) => ({ ...prev, [name]: formattedPhone }));
      
      // Clear phone error when user starts typing
      if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: "" }));
      }
    } else {
      setDriver((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: "" }));
      }
    }

    // Password validation
    if (name === "password" || name === "confirmPassword") {
      if (name === "password" && value && !passwordRegex.test(value)) {
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
  };

  // handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setDriver((prev) => ({ ...prev, [name]: file }));

      // Clear file error
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: "" }));
      }

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

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
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

      setMessage({ type: "success", text: "Google sign-in successful! Please complete the form below." });

    } catch (error: any) {
      console.log("Google sign-in error:", error);
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      let errorMessage = "Google sign-in failed. Please try again.";
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            errorMessage = "This email is already registered with a different sign-in method. Please use email and password to sign in, or click 'Forgot Password' to reset your password.";
            break;
          case 'auth/popup-blocked':
            errorMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = "Sign-in was cancelled. Please try again.";
            break;
          default:
            if (error.code.startsWith('auth/')) {
              errorMessage = `Google sign-in failed: ${error.message || 'Please try again.'}`;
            }
        }
      } else if (error?.message) {
        errorMessage = `Google sign-in failed: ${error.message}`;
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMessage({ type: "error", text: errorMessage });
      
    } finally {
      setLoading(false);
    }
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fill in all required fields correctly." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let userUid = driver.googleUid;

      // Handle authentication
      if (!driver.isGoogleUser) {
        const userCredential = await createUserWithEmailAndPassword(auth, driver.email, driver.password);
        userUid = userCredential.user.uid;
        await sendEmailVerification(userCredential.user);
      } else {
        if (!userUid) {
          throw new Error("Google user UID not found. Please sign in with Google again.");
        }
      }

      console.log("User UID:", userUid);

      // Upload images - FIXED: Consistent naming
      console.log("Uploading images...");
      
      const profileRef = ref(storage, `drivers/${userUid}/profileImage.jpg`);
      const idRef = ref(storage, `drivers/${userUid}/idImage.jpg`); // FIXED: changed from validIdImage.jpg

      console.log("Profile image:", driver.profileImage);
      console.log("ID image:", driver.idImage);

      const [profileSnapshot, idSnapshot] = await Promise.all([
        uploadBytes(profileRef, driver.profileImage!),
        uploadBytes(idRef, driver.idImage!)
      ]);

      console.log("Images uploaded successfully");

      // Get download URLs
      const [profileURL, idURL] = await Promise.all([
        getDownloadURL(profileSnapshot.ref),
        getDownloadURL(idSnapshot.ref)
      ]);

      console.log("Profile URL:", profileURL);
      console.log("ID URL:", idURL);

      // Save to Firestore
      const driverData = {
        firstName: driver.firstName.trim(),
        lastName: driver.lastName.trim(),
        email: driver.email.toLowerCase().trim(),
        phone: getFullPhoneNumber(),
        validIdNumber: driver.validIdNumber.trim(),
        profileImage: profileURL,
        idImage: idURL || "None",
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: false,
        authMethod: driver.isGoogleUser ? "google" : "email",
      };

      
      console.log("Saving to Firestore:", driverData);
      console.log("About to save to Firestore...");
      console.log("User UID:", userUid);
      console.log("Driver data:", driverData);

      await setDoc(doc(db, "drivers", userUid), driverData);

      console.log("Firestore save completed");

      // Success
      localStorage.removeItem("driverFormData");
      
      window.scrollTo({ top: 0, behavior: "smooth" });

      setMessage({ 
        type: "success", 
        text: driver.isGoogleUser 
          ? "Registration successful! Redirecting to login..." 
          : "Registration successful! Please verify your email. Redirecting to login..." 
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      console.log("Full error object:", error);
      console.log("Error code:", error?.code);
      console.log("Error message:", error?.message);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered. Please sign in instead.";
            break;
          case 'permission-denied':
            errorMessage = "Database permission denied. Please check your Firestore rules.";
            break;
          default:
            errorMessage = `Error: ${error.code}. Please try again.`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMessage({ type: "error", text: errorMessage });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="my-6 bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
          Driver Registration
        </h2>

        {message.text && (
          <div
            className={`mb-6 p-4 text-center rounded-lg font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
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
                  <div className={`bg-gray-100 text-center w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center text-sm ${
                    formErrors.profileImage ? "border-red-500 text-red-500" : "border-gray-400 text-gray-500"
                  }`}>
                    <span>Upload</span>
                    <span>Profile Photo</span>
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
              {formErrors.profileImage && (
                <small className="text-red-500 mt-2">{formErrors.profileImage}</small>
              )}
              {!formErrors.profileImage && (
                <small className="text-gray-500 mt-2">* Required</small>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  name="firstName" 
                  placeholder="First Name *" 
                  value={driver.firstName} 
                  onChange={handleChange} 
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {formErrors.firstName && (
                  <small className="text-red-500 text-sm mt-1">{formErrors.firstName}</small>
                )}
              </div>
              <div>
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Last Name *" 
                  value={driver.lastName} 
                  onChange={handleChange} 
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {formErrors.lastName && (
                  <small className="text-red-500 text-sm mt-1">{formErrors.lastName}</small>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <div className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                <span className="font-medium">WhatsApp number</span> - Enter your 10-digit number...
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">+234</span>
                </div>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="8012345678" 
                  value={driver.phone} 
                  onChange={handleChange} 
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 pl-16 ${
                    formErrors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  maxLength={10}
                />
              </div>
              {formErrors.phone && (
                <small className="text-red-500 text-sm mt-1">{formErrors.phone}</small>
              )}
              
            </div>

            {/* ID Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">Valid ID Information</h3>
              
              <div className="mb-4">
                <input 
                  type="text" 
                  name="validIdNumber" 
                  placeholder="Valid ID Number *" 
                  value={driver.validIdNumber} 
                  onChange={handleChange} 
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.validIdNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {formErrors.validIdNumber && (
                  <small className="text-red-500 text-sm mt-1">{formErrors.validIdNumber}</small>
                )}
              </div>

              {/* ID Image */}
              <div className={`border rounded-lg p-4 ${
                formErrors.idImage ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}>
                <label className="block text-gray-700 font-medium mb-2">Valid ID Image *</label>
                <input 
                  type="file" 
                  name="idImage" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {formErrors.idImage && (
                  <small className="text-red-500 text-sm mt-1">{formErrors.idImage}</small>
                )}
                {preview.idImage && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">ID Preview:</p>
                    <img src={preview.idImage} alt="ID Preview" className="w-48 h-32 object-cover rounded-md border" />
                  </div>
                )}
              </div>
            </div>

            {/* Authentication Section */}
            <div className="border-t pt-6">

              {/* google sign-in message feedback */}
              {message.type==="success" && message.text === "Google sign-in successful! Please complete the form below." ?
                <p className="text-center p-3 my-2 rounded bg-green-100 text-green-800 border border-green-200">{message.text}</p> :
                message.type ==="error" && message.text === "Google sign-in failed. Please try again." && 
                <p className="text-center p-3 my-2 rounded bg-red-100 text-red-800 border border-red-200">{message.text}</p> 
              }

              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-700 mb-2 sm:mb-0">Create Login</h3>

                {/* google sign in part */}
                <button 
                  onClick={handleGoogleSignIn} 
                  type="button" 
                  className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-2 transition-colors"
                  disabled={loading}
                >
                  <span>Sign in with Google</span>
                </button>
              </div>

              {/* email & password sign in part */}
              <div className="mb-4">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email *" 
                  value={driver.email} 
                  onChange={handleChange} 
                  className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={driver.isGoogleUser}
                />
                {formErrors.email && (
                  <small className="text-red-500 text-sm mt-1">{formErrors.email}</small>
                )}
              </div>

              {passwordError && (
                <div className="p-3 text-white text-center bg-red-600 text-sm rounded-lg mb-4">
                  {passwordError}
                </div>
              )}

              {!driver.isGoogleUser && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Password must be 8+ characters and include letters + numbers
                  </div>
                  <div>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Password *" 
                      value={driver.password} 
                      onChange={handleChange} 
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {formErrors.password && (
                      <small className="text-red-500 text-sm mt-1">{formErrors.password}</small>
                    )}
                  </div>
                  <div>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      placeholder="Confirm Password *" 
                      value={driver.confirmPassword} 
                      onChange={handleChange} 
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {formErrors.confirmPassword && (
                      <small className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</small>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="font-semibold w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Processing Registration...
                </div>
              ) : (
                "Register as Driver"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button 
            onClick={() => router.push("/login")} 
            className="text-blue-600 font-medium hover:underline"
            disabled={loading}
          >
            Login 
          </button>
          {"  "}or{"  "}
          <button 
            onClick={() => router.push("/forgot-password")} 
            className="text-blue-600 font-medium hover:underline"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}
