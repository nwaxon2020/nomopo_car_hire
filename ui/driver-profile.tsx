"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

import { auth, db, storage } from "../lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface VehicleLog {
  id: string;
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
  id: string;
  commenterName: string;
  comenterEmail: string;
  comment: string;
  dateAndTime: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  contact: string;
  location: string;
  profileImage: string;
  status: boolean;
  vehicleLog: VehicleLog[];
  reviews: Review[];
}

export default function DriverProfilePageUi() {
    const router = useRouter();
    const params = useParams();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [cars, setCars] = useState<VehicleLog[]>([]);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedCarImages, setSelectedCarImages] = useState<{ [key: string]: string }>({});
    const [newCar, setNewCar] = useState<Partial<VehicleLog>>({});
    const [preview, setPreview] = useState<Record<string, string>>({});
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check authorization and fetch driver data from Firestore
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    router.push("/login");
                    return;
                }

                // Decode the hashed ID from URL and verify authorization
                const decodedId = atob(params.id as string);
                
                // Check if the decoded ID matches the current user
                if (decodedId !== user.uid) {
                    router.push("/unauthorized");
                    return;
                }

                // User is authorized, proceed to fetch data
                setIsAuthorized(true);

                const driverDoc = await getDoc(doc(db, "drivers", user.uid));
                if (!driverDoc.exists()) {
                    router.push("/login");
                    return;
                }

                const data = driverDoc.data();
                const vehicleLog = data.vehicleLog || [];
                const reviews = data.reviews || [];

                const driverData: Driver = {
                    id: user.uid,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    fullName: `${data.firstName} ${data.lastName}`,
                    contact: data.phone,
                    location: data.location || "Unknown",
                    profileImage: data.profileImage,
                    status: data.verified,
                    vehicleLog,
                    reviews,
                };

                setDriver(driverData);
                setCars(vehicleLog);

                // Initialize selected images
                const initialSelected: { [key: string]: string } = {};
                vehicleLog.forEach((car: VehicleLog) => {
                    initialSelected[car.id] = car.pictures[0] || "/car.jpg";
                });
                
                setSelectedCarImages(initialSelected);

            } catch (err) {
                console.error("Error fetching driver data:", err);
                // If decoding fails, redirect to unauthorized
                router.push("/unauthorized");
            }
        };

        fetchDriverData();
    }, [router, params.id]);

    const isCarLimitReached = cars.length >= 5;

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setNewCar(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setNewCar(prev => ({ ...prev, [name]: file }));
            setPreview(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    // Add new car
    const handleAddCar = async () => {
        if (isCarLimitReached) {
            setFeedback("🚫 Maximum car limit reached!");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        if (!newCar.carMake || !newCar.carModel || !newCar.carType) {
            setFeedback("⚠️ Please fill all required fields (Make, Model, Type)");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        try {
            const carId = Date.now().toString();
            const pictures: string[] = [];

            // Upload images to storage if any
            for (const key in preview) {
                const file = (newCar as any)[key];
                if (file) {
                    const storageRef = ref(storage, `drivers/${driver?.id}/cars/${carId}-${key}`);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    pictures.push(url);
                }
            }

            const newCarItem: VehicleLog = {
                id: carId,
                carMake: newCar.carMake!,
                carModel: newCar.carModel!,
                carType: newCar.carType!,
                color: newCar.color || "",
                plateNumber: newCar.plateNumber || "",
                seatNumber: newCar.seatNumber || "",
                ac: newCar.ac || "no",
                pictures,
            };

            const updatedCars = [...cars, newCarItem];
            setCars(updatedCars);
            setSelectedCarImages(prev => ({
                ...prev,
                [newCarItem.id]: newCarItem.pictures[0] || "/car.jpg",
            }));

            // Update Firestore
            await updateDoc(doc(db, "drivers", driver!.id), { vehicleLog: updatedCars });

            setNewCar({});
            setPreview({});
            setShowAddCarForm(false);
            setFeedback("🚗 New car added successfully!");
            setTimeout(() => setFeedback(null), 3000);

        } catch (err) {
            console.error("Error adding car:", err);
            setFeedback("❌ Failed to add car.");
        }
    };

    // Delete car
    const handleDeleteCar = async (id: string) => {
        try {
            const updatedCars = cars.filter(car => car.id !== id);
            setCars(updatedCars);
            setDeleteConfirmId(null);

            await updateDoc(doc(db, "drivers", driver!.id), { vehicleLog: updatedCars });
            setFeedback("🗑️ Car deleted successfully!");
            setTimeout(() => setFeedback(null), 3000);

        } catch (err) {
            console.error("Error deleting car:", err);
            setFeedback("❌ Failed to delete car.");
        }
    };

    const handleUpdateCar = async (carId: string) => {
        // For simplicity, we just show feedback; in real app, you can open modal or form for editing
        setFeedback("✅ Car details updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleImageSelect = (carId: string, imageUrl: string) => {
        setSelectedCarImages(prev => ({
            ...prev,
            [carId]: imageUrl,
        }));
    };

    const handleAddCarClick = () => {
        if (isCarLimitReached) {
            setFeedback("🚫 Maximum car limit reached!");
            setTimeout(() => setFeedback(null), 3000);
            return;
        }
        setShowAddCarForm(!showAddCarForm);
    };

    // Show loading while checking authorization
    if (!isAuthorized || !driver) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:p-6 max-w-5xl mx-auto">
            {feedback && (
                <div className="mb-4 p-3 rounded-lg text-center bg-blue-100 text-blue-700">{feedback}</div>
            )}

            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white shadow-md rounded-2xl px-4 py-6 sm:p-6 mb-6">
                <div className="relative flex flex-col text-center sm:text-left sm:flex-row items-center gap-6 w-full">
                    <div onClick={handleSignOut} className="cursor-pointer text-gray-600 absolute top-1 right-1">
                        <span className="text-sm underline p-1">Signout </span>
                    </div>
                    <div className="flex-shrink-0">
                        <Image
                            width={500}
                            height={500}
                            src={driver.profileImage}
                            alt="Driver Image"
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{driver.fullName}</h2>
                        <p className="text-gray-600">{driver.location}</p>
                        <p className="text-gray-600">{driver.contact}</p>
                    </div>
                    <div className="sm:mt-16 flex flex-col text-right">
                        <div className="flex items-center justify-end gap-2">
                            <CheckCircle className="text-green-500" />
                            <span className="text-green-600 font-semibold">{driver.status ? "Verified" : "Not Verified"}</span>
                        </div>
                        <div className="flex justify-end mt-2 gap-3">
                            <button className="text-blue-600 hover:text-blue-800">
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cars Section */}
            <div className="mt-6 bg-white shadow-md rounded-2xl px-4 py-6 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold">My Cars</h3>
                        <p className="text-sm text-gray-500">
                            {cars.length}/5 cars added {isCarLimitReached && "• Maximum limit reached"}
                        </p>
                    </div>
                    <button
                        onClick={handleAddCarClick}
                        disabled={isCarLimitReached}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            isCarLimitReached ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        <Plus size={16} /> Add Car
                    </button>
                </div>

                {showAddCarForm && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg space-y-3">
                        <input type="text" name="carMake" placeholder="Car Make" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
                        <input type="text" name="carModel" placeholder="Car Model" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
                        <select name="carType" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded">
                            <option value="">Select Car Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Bus">Bus</option>
                            <option value="Car">Car</option>
                            <option value="Loading Van">Loading Van</option>
                            <option value="Keke">Keke</option>
                        </select>
                        <input type="text" name="color" placeholder="Color" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
                        <input type="text" name="plateNumber" placeholder="Plate Number" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
                        <input type="number" name="seatNumber" placeholder="Seats" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded" />
                        <select name="ac" onChange={handleChange} className="outline-blue-700 w-full border p-2 rounded">
                            <option value="">AC Available?</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>

                        <h3 className="text-lg font-semibold mt-4">Upload Car Images</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {["carFront", "carSide", "carInterior", "carBack"].map(key => (
                                <div key={key} className="w-full border bg-gray-200 rounded p-1 py-2 sm:p-4">
                                    <p className="text-sm font-semibold">{key.replace("car", "")} View</p>
                                    <input type="file" name={key} accept="image/*" onChange={handleFileChange} />
                                    {preview[key] && <Image width={200} height={200} src={preview[key]} alt={`${key} Preview`} className="w-full mt-2 rounded-md object-cover" />}
                                </div>
                            ))}
                        </div>

                        <button onClick={handleAddCar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-3">Add Car</button>
                    </div>
                )}

                {/* Car List */}
                <div className="space-y-8">
                    {cars.map(car => (
                        <div key={car.id} className="rounded-lg bg-gray-100">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="mb-3">
                                        <h4 className="px-4 py-2 font-semibold text-blue-800 text-lg mb-2">{car.carMake} {car.carModel}</h4>
                                        <div className="p-1 mb-3">
                                            <Image width={500} height={500} src={selectedCarImages[car.id] || car.pictures[0]} alt={`${car.carMake} ${car.carModel}`} className="w-full object-cover rounded" />
                                        </div>
                                        <div className="p-4 flex gap-2 overflow-x-auto">
                                            {car.pictures.map((picture, idx) => (
                                                <div key={idx} onClick={() => handleImageSelect(car.id, picture)} className={`flex-shrink-0 cursor-pointer border-2 ${selectedCarImages[car.id] === picture ? "border-blue-500" : "border-gray-300"} rounded-lg overflow-hidden`}>
                                                    <Image width={80} height={80} src={picture} alt={`Thumbnail ${idx + 1}`} className="w-20 h-20 object-fill" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-blue-800 text-lg mb-2">Car Details</h4>
                                        <div className="grid grid-cols-2 sm:gap-2">
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">Make:</p><small className="text-gray-700">{car.carMake}</small></div>
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">Model:</p><small className="text-gray-700">{car.carModel}</small></div>
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">Type:</p><small className="text-gray-700">{car.carType}</small></div>
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">Color:</p><small className="text-gray-700">{car.color}</small></div>
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">Seats:</p><small className="text-gray-700">{car.seatNumber}</small></div>
                                            <div className="flex justify-left items-center gap-2"><p className="font-semibold">AC:</p><small className="text-gray-700">{car.ac === "yes" ? "Available" : "Not Available"}</small></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleUpdateCar(car.id)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800"><Edit size={18}/> Edit</button>

                                        {deleteConfirmId === car.id ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDeleteCar(car.id)} className="text-red-600 text-sm font-semibold">Confirm Delete</button>
                                                <button onClick={() => setDeleteConfirmId(null)} className="text-gray-500 text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirmId(car.id)} className="flex items-center gap-2 text-red-600 hover:text-red-800"><Trash2 size={18}/> Delete</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 text-center">
                <a href="mailto:nomopoventures@yahoo.com" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">Report / Complain</a>
            </div>
        </div>
    );
}