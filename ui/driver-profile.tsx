"use client";

import React, { useState } from "react";
import { Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface VehicleLog {
    id: number;
    carMake: string;
    carModel: string;
    carType: string;
    color: string;
    plateNumber: string;
    seatNumber: string;
    ac: string;
    pictures: string[];
}

interface Review {
    id: number;
    commenterName: string;
    comenterEmail: string;
    comment: string;
    dateAndTime: string;
}

interface Driver {
    id: number;
    driverName: string;
    contact: string;
    status: boolean;
    location: string;
    vehicleLog: VehicleLog[];
    reviews: Review[];
}

export default function DriverProfilePageUi() {
   
    const driver: Driver = {
        id: 1,
        driverName: "Prince Martins",
        location: "Sagamu, Ogun State",
        contact: "07034632037",
        status: true,
        vehicleLog: [
            {
                id: 1,
                carMake: "Honda",
                carType: "Sedan",
                carModel: "Accord",
                color: "Gray",
                plateNumber: "ABC788",
                seatNumber: "4",
                ac: "No",
                pictures: [
                    "/carr.jpg",
                    "/car.jpg",
                    "/carz.jpg",
                ]
            },
            {
                id: 2,
                carMake: "Toyota",
                carModel: "Camrey",
                carType: "SUV",
                color: "Blue",
                plateNumber: "DDCV7788",
                seatNumber: "5",
                ac: "yes",
                pictures: [
                    "/car.jpg",
                    "/car.jpg",
                    "/per.jpg",
                ]
            },
        ],
        reviews: [
            {
                id: 1,
                commenterName: "John",
                comenterEmail: "john@gmail.com",
                comment: "This guy has great driving skills",
                dateAndTime: "18/02/2025",
            },
            {
                id: 2,
                commenterName: "Ojo",
                comenterEmail: "ojo@gmail.com",
                comment: "This guy is not good",
                dateAndTime: "18/02/2025",
            },
        ],
    };

    const [cars, setCars] = useState<VehicleLog[]>(driver.vehicleLog);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [selectedCarImages, setSelectedCarImages] = useState<{[key: number]: string}>({});

    const [newCar, setNewCar] = useState({
        carMake: "",
        carModel: "",
        carType: "",
        color: "",
        plateNumber: "",
        seatNumber: "",
        ac: "",
        pictures: [] as string[],
    });

    const [preview, setPreview] = useState<Record<string, string>>({});

    // Check if car limit is reached
    const isCarLimitReached = cars.length >= 5;

    // Initialize selected images with first picture of each car
    React.useEffect(() => {
        const initialSelected: {[key: number]: string} = {};
        driver.vehicleLog.forEach(car => {
            initialSelected[car.id] = car.pictures[0];
        });
        setSelectedCarImages(initialSelected);
    }, []);

    // ✅ Handle input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setNewCar((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Handle file input & preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setNewCar((prev) => ({ ...prev, [name]: file }));
            setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    // ✅ Add new car
    const handleAddCar = () => {
        if (isCarLimitReached) {
            setFeedback("🚫 Maximum car limit reached! Delete a car to add a new one.");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        if (!newCar.carMake || !newCar.carModel || !newCar.carType) {
            setFeedback("⚠️ Please fill all required fields (Make, Model, Type, e.t.c)");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        const newCarItem: VehicleLog = {
            id: Date.now(),
            carMake: newCar.carMake,
            carModel: newCar.carModel,
            carType: newCar.carType,
            color: newCar.color,
            plateNumber: newCar.plateNumber,
            seatNumber: newCar.seatNumber,
            ac: newCar.ac,
            pictures: Object.values(preview), // Use uploaded images
        };

        setCars([...cars, newCarItem]);
        setSelectedCarImages(prev => ({
            ...prev,
            [newCarItem.id]: newCarItem.pictures[0] || "/car.jpg"
        }));
        
        setNewCar({
            carMake: "",
            carModel: "",
            carType: "",
            color: "",
            plateNumber: "",
            seatNumber: "",
            ac: "",
            pictures: [],
        });
        setPreview({});
        setShowAddCarForm(false);
        window.scrollTo({top:0, behavior:"smooth"})
        setFeedback("🚗 New car added successfully!");
        setTimeout(() => setFeedback(null), 3000);
    };

    // ✅ Update car image selection
    const handleImageSelect = (carId: number, imageUrl: string) => {
        setSelectedCarImages(prev => ({
            ...prev,
            [carId]: imageUrl
        }));
    };

    // ✅ Update feedback
    const handleUpdateCar = (id: number) => {
        window.scrollTo({top:0, behavior:"smooth"})
        setFeedback("✅ Car details updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
    };

    // ✅ Delete car
    const handleDeleteCar = (id: number) => {
        setCars(cars.filter((car) => car.id !== id));
        setFeedback("🗑️ Car deleted successfully!");
        window.scrollTo({top:0, behavior:"smooth"})
        setTimeout(() => setFeedback(null), 3000);
        setDeleteConfirmId(null);
    };

    // ✅ Handle add car button click
    const handleAddCarClick = () => {
        if (isCarLimitReached) {
            setFeedback("🚫 Maximum car limit reached! Delete a car to add a new one.");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }
        setShowAddCarForm(!showAddCarForm);
    };

    return (
        <div className="px-4 py-6 sm:p-6 max-w-5xl mx-auto">
            {/* ✅ Feedback message */}
            {feedback && !feedback.includes("⚠️ Please fill all required fields (Make, Model, Type, e.t.c)") && (
                <div className={`mb-4 p-3 rounded-lg text-center ${
                    feedback.includes("Maximum") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                    {feedback}
                </div>
            )}

            {/* Car Limit Warning */}
            {isCarLimitReached && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-center">
                    ⚠️ You have reached the maximum limit of 5 cars. Please delete a car to add a new one.
                </div>
            )}

            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white shadow-md rounded-2xl px-4 py-6 sm:p-6">
                {/* Profile Picture */}
                <div className="flex flex-col text-center sm:text-left sm:flex-row items-center gap-6 w-full">
                    <div className="flex-shrink-0">
                        <Image
                            width={500}
                            height={500}
                            src={"/driver2.jpeg"}
                            alt={"Driver Image"}
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                        />
                    </div>

                    {/* Driver Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{driver.driverName}</h2>
                        <p className="text-gray-600">{driver.location}</p>
                        <p className="text-gray-600">{driver.contact}</p>
                    </div>

                    {/* Right Side Info */}
                    <div className="flex flex-col  text-right">
                        <div className="flex items-center justify-end gap-2">
                            <CheckCircle className="text-green-500" />
                            <span className="text-green-600 font-semibold">Verified</span>
                        </div>
                        <div className="flex justify-end mt-2 gap-3">
                            <button className="text-blue-600 hover:text-blue-800">
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-6 bg-white shadow-md rounded-2xl px-4 py-6 sm:p-6">
                <h3 className="text-lg font-semibold mb-3">Reviews</h3>
                <div className="space-y-3">
                    {driver.reviews.map((review) => (
                        <div key={review.id} className="border p-3 rounded-lg">
                            <p className="font-semibold">{review.commenterName} <small className="font-normal underline text-[goldenrod]">{review.comenterEmail}</small></p>
                            <p className="text-gray-600 text-sm">{review.comment}</p>
                            <p className="text-gray-400 text-xs mt-1">{review.dateAndTime}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cars Section */}
            <div className="mt-6 bg-white shadow-md rounded-2xl px-4 py-6 sm:p-6">

                {/* Number if cars added */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold">My Cars</h3>
                        <p className="text-sm text-gray-500">
                            {cars.length}/5 cars added {isCarLimitReached && "• Maximum limit reached"}
                        </p>
                    </div>

                    {/* Add car button */}
                    <button
                        onClick={handleAddCarClick}
                        disabled={isCarLimitReached}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            isCarLimitReached 
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        <Plus size={16} /> Add Car
                    </button>
                </div>

                {/* ✅ Add Car Form */}
                {showAddCarForm && !isCarLimitReached && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg space-y-3">
                        <input
                            type="text"
                            name="carMake"
                            placeholder="Car Make (e.g. Toyota)"
                            required
                            value={newCar.carMake}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        />

                        <input
                            type="text"
                            name="carModel"
                            placeholder="Car Model (e.g. Corolla)"
                            required
                            value={newCar.carModel}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        />

                        <select
                            name="carType"
                            value={newCar.carType}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                            required
                        >
                            <option value="">Select Car Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Bus">Bus</option>
                            <option value="Car">Car</option>
                            <option value="Loading Van">Loading Van</option>
                            <option value="Keke">Keke</option>
                        </select>

                        <input
                            type="text"
                            name="color"
                            placeholder="Car Color"
                            required
                            value={newCar.color}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        />

                        <input
                            type="text"
                            name="plateNumber"
                            placeholder="Car Plate-Number"
                            required
                            value={newCar.plateNumber}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        />

                        <input
                            type="number"
                            name="seatNumber"
                            placeholder="Number of Passengers"
                            required
                            value={newCar.seatNumber}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        />

                        <select
                            name="ac"
                            value={newCar.ac}
                            onChange={handleChange}
                            className="outline-blue-700 w-full border p-2 rounded"
                        >
                            <option value="">AC Available?</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>

                        {/* ✅ Car Images Upload */}
                        <h3 className="text-lg font-semibold mt-4 text-gray-800">
                            Upload Car Images
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {["carFront", "carSide", "carInterior", "carBack"].map((key) => (
                                <div
                                    key={key}
                                    className="sm:w-full border bg-gray-200 rounded p-1 py-2 sm:p-4"
                                >
                                    <p className="text-sm font-semibold">
                                        {key.replace("car", "")} View
                                    </p>
                                    <input
                                        type="file"
                                        name={key}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {preview[key] && (
                                        <Image
                                            width={200}
                                            height={200}
                                            src={preview[key]}
                                            alt={`${key} Preview`}
                                            className="w-full mt-2 rounded-md object-cover"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* add car error message */}
                        {feedback === "⚠️ Please fill all required fields (Make, Model, Type, e.t.c)" && (
                            <div className={`mb-4 p-3 rounded-lg text-center ${
                                feedback.includes("⚠️ Please fill all required fields (Make, Model, Type, e.t.c)") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                                {feedback}
                            </div>
                        )}

                        {/* Add car Submit form Button */}
                        <button
                            onClick={handleAddCar}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-3"
                        >
                            Add Car
                        </button>
                    </div>
                )}

                {/* ✅ Car List with Side-by-Side Images */}
                <div className="space-y-8">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className=" rounded-lg bg-gray-100"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Car Images Section */}
                                <div className="flex-1">
                                    <div className="mb-3">
                                        <h4 className="px-4 py-2 font-semibold text-blue-800 text-lg mb-2">{car.carMake} {car.carModel}</h4>
                                        {/* Main Selected Image */}
                                        <div className="p-1 mb-3">
                                            <Image
                                                width={500}
                                                height={500}
                                                src={selectedCarImages[car.id] || car.pictures[0]}
                                                alt={`${car.carMake} ${car.carModel}`}
                                                className="w-full object-cover rounded"
                                            />
                                        </div>
                                        {/* Thumbnail Images Side by Side */}
                                        <div className="p-4 flex gap-2 overflow-x-auto">
                                            {car.pictures.map((picture, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleImageSelect(car.id, picture)}
                                                    className={`flex-shrink-0 cursor-pointer border-2 ${
                                                        selectedCarImages[car.id] === picture 
                                                            ? "border-blue-500" 
                                                            : "border-gray-300"
                                                    } rounded-lg overflow-hidden`}
                                                >
                                                    <Image
                                                        width={80}
                                                        height={80}
                                                        src={picture}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-20 h-20 object-fill"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Car Details Section */}
                                <div className="flex-1 p-4">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-blue-800 text-lg mb-2">Car Details</h4>
                                        <div className="grid grid-cols-2 sm:gap-2">
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">Make:</p>
                                                <small className="text-gray-700">{car.carMake}</small>
                                            </div>
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">Model:</p>
                                                <small className="text-gray-700">{car.carModel}</small>
                                            </div>
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">Type:</p>
                                                <small className="text-gray-700">{car.carType}</small>
                                            </div>
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">Color:</p>
                                                <small className="text-gray-700">{car.color}</small>
                                            </div>
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">Seats:</p>
                                                <small className="text-gray-700">{car.seatNumber}</small>
                                            </div>
                                            <div className="flex justify-left items-center gap-2">
                                                <p className="font-semibold">AC:</p>
                                                <small className="text-gray-700">{car.ac === "yes" ? "Available" : "Not Available"}</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleUpdateCar(car.id)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit size={18} />
                                            Edit
                                        </button>

                                        {deleteConfirmId === car.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeleteCar(car.id)}
                                                    className="text-red-600 text-sm font-semibold"
                                                >
                                                    Confirm Delete
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="text-gray-500 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirmId(car.id)}
                                                className="flex items-center gap-2 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={18} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>

            {/* Complaint Button */}
            <div className="mt-6 text-center">
                <Link href={"mailto:nomopoventures@yahoo.com"} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                    Report / Complain
                </Link>
            </div>
        </div>
    );
}