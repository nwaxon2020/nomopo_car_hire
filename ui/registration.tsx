"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DriverRegisterPageUi() {
  const router = useRouter();

  const [driver, setDriver] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profileImage: null as File | null,
    idImage: null as File | null,
    carFront: null as File | null,
    carSide: null as File | null,
    carInterior: null as File | null,
    carMake: "",
    carModel: "",
    carType: "",
    carColor: "",
    passengerCount: "",
  });

  const [preview, setPreview] = useState({
    profileImage: "",
    idImage: "",
    carFront: "",
    carSide: "",
    carInterior: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const [phoneError, setPhoneError] = useState("");

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("driverFormData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setDriver((prev) => ({ ...prev, ...parsed }));
    }
  }, []);

  // Save form data whenever it changes (excluding file objects)
  useEffect(() => {
    const { password, confirmPassword, ...rest } = driver;
    const dataToSave = {
      ...rest,
      password,
      confirmPassword,
    };
    localStorage.setItem("driverFormData", JSON.stringify(dataToSave));
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDriver((prev) => ({ ...prev, [name]: value }));

    // Password match check
    if (name === "password" || name === "confirmPassword") {
      if (
        (name === "confirmPassword" && value !== driver.password) ||
        (name === "password" && driver.confirmPassword && value !== driver.confirmPassword)
      ) {
        setPasswordError("Passwords do not match!");
      } else {
        setPasswordError("");
      }
    }

    // Phone number check for +234
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
        !driver.fullName ||
        !driver.email ||
        !driver.password ||
        !driver.confirmPassword ||
        !driver.phone ||
        !driver.profileImage||
        !driver.idImage ||
        !driver.carFront ||
        !driver.carSide ||
        !driver.carInterior ||
        !driver.carMake ||
        !driver.carModel ||
        !driver.carType ||
        !driver.carColor ||
        !driver.passengerCount
    ) {
        window.scrollTo({top: 0, behavior: "smooth"})
        setMessage({ type: "error", text: "Please fill in all required fields including profile image." });
        return;
    }

    if (driver.password !== driver.confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match." });
        return;
    }

    window.scrollTo({top: 0, behavior: "smooth"})

    setMessage({
        type: "success",
        text: "Registration successful! You’ll be verified within 72 hours.",
    });

    // Clear localStorage on success
    localStorage.removeItem("driverFormData");

    setTimeout(() => router.push("/login"), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-2 sm:p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-600">
          Driver Registration
        </h2>

        {/* Global Message */}
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

          {/* Personal Info */}

          {/* Driver full name input */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={driver.fullName}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={driver.email}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Phone Number input */}
          <small className="text-black bg-gray-100 p-1 rounded"><span className="font-bold">WhatsApp number</span> is required for easy comunication with customers</small>
          
          {phoneError && (
              <div className="my-[5px] text-red-600 text-sm mt-1">
                {phoneError}
              </div>
            )
          }
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={driver.phone}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Password input */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={driver.password}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={driver.confirmPassword}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Password mismatch */}
          {passwordError && (
            <div className="bg-red-600 text-white text-center py-2 rounded-md text-sm">
              {passwordError}
            </div>
          )}

          {/* ID Upload */}
          <div className="border rounded p-2 bg-gray-200">
            <label className="block text-gray-700 mb-1">Valid ID Image</label>
            <input type="file" name="idImage" accept="image/*" onChange={handleFileChange} />
            {preview.idImage && (
              <img src={preview.idImage} alt="ID Preview" className="w-32 mt-2 rounded-md" />
            )}
          </div>

          {/* Car Info */}
          <h3 className="text-lg font-semibold mt-6 text-gray-800">Car Information</h3>

          {/* Car Make Input */}
          <input
            type="text"
            name="carMake"
            placeholder="Car Make (e.g. Toyota)"
            value={driver.carMake}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Car Model input */}
          <input
            type="text"
            name="carModel"
            placeholder="Car Model (e.g. Corolla)"
            value={driver.carModel}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Car Type input Select */}
          <select
            name="carType"
            value={driver.carType}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
            required
          >
            <option value="">Select Car Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="bus">Bus</option>
            <option value="car">Car</option>
            <option value="loadingVan">Loading Van</option>
            <option value="keke">Keke</option>
          </select>
          
          {/* Car Color input */}
          <input
            type="text"
            name="carColor"
            placeholder="Car Color"
            value={driver.carColor}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Car passenger number input */}
          <input
            type="number"
            name="passengerCount"
            placeholder="Number of Passengers"
            value={driver.passengerCount}
            onChange={handleChange}
            className="outline-blue-700 w-full border p-2 rounded"
          />

          {/* Car Images */}
          <h3 className="text-lg font-semibold mt-6 text-gray-800">Upload Car Images</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {["carFront", "carSide", "carInterior"].map((key) => (
              <div key={key} className="border bg-gray-200 rounded p-1 py-2 sm:p-4">
                <p className="text-sm font-semibold">{key.replace("car", "")} View</p>
                <input type="file" name={key} accept="image/*" onChange={handleFileChange}/>
                {preview[key as keyof typeof preview] && (
                  <img
                    src={preview[key as keyof typeof preview]}
                    alt={`${key} Preview`}
                    className="w-full mt-2 rounded-md"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="font-semibold w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
