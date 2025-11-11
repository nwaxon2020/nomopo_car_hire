"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import axios from "axios"

// Page interfaces
interface VehicleLog {
    id: number;
    carMake: string;
    carModel: string;
    carType: string;
    color: string;
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

export default function BookCarUi(){
    // Toggle Select Button
    const [driverCard, setDriverCard] = useState(false)

    // Pop up driver name before booking
    const [selectDriver, setSelectDriver] = useState("")

    // Close driver's information page
    const [driverInfo, setDriverInfo] = useState(false)

    // Selected driver and vehicle state
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleLog | null>(null)

    // Search Car by location and category
    const [searchLocation, setSearchLocation] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    // New state to handle review form inputs
    const [reviewForm, setReviewForm] = useState({ name: "", email: "", comment: "" })
    const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" })

    // Car hero image setter and thumbnail images
    const images = [
        "/carr.jpg",
        "/car.jpg",
        "/carz.jpg",
    ];
    const [mainImage, setMainImage] = useState(images[0]);

    // Mock drivers list
    const drivers: Driver[] = [
        {
            id: 1,
            driverName: "Prince Martins",
            location:"Sagamu, Ogun State",
            contact: "07034632037",
            status: true,
            vehicleLog: [
                {
                    id: 1,
                    carMake: "Honda",
                    carType: "Sedan",
                    carModel: "Accord",
                    color: "Gray",
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
        },
        {
            id: 2,
            driverName: "Michael Udo",
            location:"Oshodi, Lagos State",
            contact: "09082345611",
            status: false,
            vehicleLog: [
                {
                    id: 1,
                    carMake: "Toyota",
                    carType: "Bus",
                    carModel: "Siena",
                    color: "Gray",
                    seatNumber: "7",
                    ac: "No",
                    pictures: [
                        "/carz.jpg",
                        "/car.jpg",
                        "/carr.jpg",
                    ]
                },
                {
                    id: 2,
                    carMake: "Toyota",
                    carModel: "Corolla",
                    carType: "Car",
                    color: "Blue",
                    seatNumber: "4",
                    ac: "yes",
                    pictures: [
                        "/car.jpg",
                        "/carr.jpg",
                        "/per.jpg",
                    ]
                },
            ],
            reviews: [
                {
                    id: 1,
                    commenterName: "Mike",
                    comenterEmail: "mike@gmail.com",
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
        },
    ]

    // Filter drivers by location and category
    const filteredDrivers = drivers.map((driver) => {
        const filteredVehicles = driver.vehicleLog.filter((vehicle) => {
            const locationMatch = driver.location.toLowerCase().includes(searchLocation.toLowerCase())
            const categoryMatch = selectedCategory === "all" || vehicle.carType.toLowerCase() === selectedCategory.toLowerCase()
            return locationMatch && categoryMatch
        })
        return { ...driver, vehicleLog: filteredVehicles }

    }).filter((driver) => driver.vehicleLog.length > 0)

    // Handle driver selection
    const handleDriverSelect = (driver: Driver, vehicle: VehicleLog) => {
        setSelectedDriver(driver)
        setSelectedVehicle(vehicle)
        setDriverInfo(true)
        setMainImage(vehicle.pictures[0])
        setDriverCard(false) // Close the selection dropdown
        window.scrollTo({top: 0, behavior: "smooth"})
    }

    // Handle review input change
    const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setReviewForm(prev => ({ ...prev, [name]: value }))
    }

    // Handle complain button
    const handleComplain = (driverName: string, vehicle: VehicleLog) => {
        setSelectDriver(`${driverName} - ${vehicle.carMake} ${vehicle.carModel}`)
        window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"})
    }

    // Handle review submission
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedDriver) return

        try {
            // Mock API POST request (replace with your actual API endpoint)
            const response = await axios.post("/api/reviews", {
                driverId: selectedDriver.id,
                ...reviewForm,
                dateAndTime: new Date().toLocaleDateString(),
                id: Math.floor(Math.random() * 100000) // mock ID
            })

            // Update driver reviews immediately in UI
            const newReview: Review = response.data
            selectedDriver.reviews.push(newReview)

            // Clear form
            setReviewForm({ name: "", email: "", comment: "" })
            setReviewMessage({ type: "success", text: "Comment posted successfully!" })
        } catch (error) {
            console.error(error)
            setReviewMessage({ type: "error", text: "Failed to post comment. Try again." })
        }
    }

    return(
        <div className="p-5 relative bg-[#F9FAF9]">
            {/* Select Car Page */}
            <div className="p-8 mx-auto my-[2rem] max-w-[40rem] bg-white rounded-lg">
                {/* Book Page Header section */}
                <div className="pt-4 left-0 top-0 text-center w-full">
                    <h1 className="mb-2 text-xl md:text-2xl text-gray-600 font-extrabold">Book a Car</h1>
                    <div className="m-2 p-2 sm:p-2 rounded bg-gray-200 font-semibold text-red-800">
                        <small><span className="font-black">Important Notice:</span> Please make sure you contact drivers, book appointments properly, negotiate on or before services.</small>
                    </div>
                </div>

                {/* Selected Car Display */}
                {selectedDriver && selectedVehicle && (
                    <div className="mt-16 z-20 max-w-[15rem] text-[12px] mb-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between"><h3 className="font-bold text-green-800">Selected Vehicle:</h3> <small className="underline text-gray-400">just now</small></div>
                        <p>{selectedDriver.driverName} - {selectedVehicle.carMake} {selectedVehicle.carModel}</p>
                        <small className="text-green-600">Contact: {selectedDriver.contact}</small>
                    </div>
                )}

                {/* Car Hero Image for the Book Page */}
                <Image 
                    className="mt-5 mb-2 mx-auto"
                    src={selectedVehicle?.pictures[0] || "/car_select.jpg"}
                    alt="Car Picture"
                    width={300}
                    height={300}
                />

            
                <div className="sm:mx-20 mt-[-22px] flex flex-col gap-6 justify-center items-center">
                    <div className="mb-0 w-full cursor-pointer">

                        {/* Select button to drop down page showing different driver cards */}
                        <div 
                            className="flex justify-between rounded-lg p-2 border-2 border-gray-300 text-left text-gray-700 hover:bg-gray-200"
                            onClick={() => setDriverCard(!driverCard)}
                        >
                            <p>Select a Car</p> 
                            {driverCard ? 
                                <span className="mr-2 text-left text-gray-500 font-semibold">{"⮝"}</span> :
                                <span className="mr-2 text-left text-gray-500 font-semibold">{"⮟"}</span>
                            }
                        </div>

                        {/* Driver's Cards Where user can see cars and select a driver */}
                        {driverCard && (
                            <div className="car-cards max-h-[60vh] overflow-y-auto">

                                {/* Search Button input*/}
                                <div className="relative text-center m-3 my-5 sm:m-6 ">
                                    <input 
                                        className="mx-auto w-full rounded outline-blue-600 py-1 px-3 border-2 border-gray-400"  
                                        type="text" name="searchLocation" id="searchLocation" placeholder="Search Location"
                                        value={searchLocation}
                                        onChange={(e) => setSearchLocation(e.target.value)}
                                    />

                                    {/* search logo fa fa */}
                                    <i className="absolute top-2 right-2 fa fa-search" style={{fontSize:"20px", color:"gray", fontWeight:"lighter"}}></i>
                                </div>

                                {/*Select Car cartegory */}
                                <div className="my-4 mx-6">
                                    <select  
                                        className="text-gray-500 outline-blue-600 w-50 p-2 border-2 border-gray-300 rounded-sm"
                                        name="catigory" id="catigory"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="bus">Bus</option>
                                        <option value="car">Car</option>
                                        <option value="loadingVan">Loading Van</option>
                                        <option value="keke">Keke</option>
                                    </select>
                                </div>

                                {/* Display Filtered Results */}
                                {filteredDrivers.length === 0 ? (
                                <p className="text-center text-gray-500 italic">
                                    No drivers found for your search.
                                </p>
                                ) : (
                                filteredDrivers.map((driver) =>
                                    driver.vehicleLog.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="my-6 p-2 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 items-center bg-gray-100 rounded-lg"
                                    >
                                        <Image
                                        src={vehicle.pictures[0]}
                                        alt="Car picture"
                                        width={100}
                                        height={100}
                                        className="w-full flex-1 rounded-lg p-2 bg-white object-contain"
                                        />

                                        <div className="flex-2 flex flex-col gap-1 justify-around items-start">
                                        <small className="text-red-800 font-semibold">
                                            Driver's Name:{" "}
                                            <span className="text-gray-700 font-black">
                                            {driver.driverName}
                                            </span>
                                        </small>
                                        <small className="text-red-800 font-semibold">
                                            Location:{" "}
                                            <span className="text-gray-700 font-black">
                                            {driver.location}
                                            </span>
                                        </small>
                                        <small className="text-red-800 font-semibold">
                                            Car Model:{" "}
                                            <span className="text-gray-700 font-black">
                                            {vehicle.carMake} {vehicle.carModel}
                                            </span>
                                        </small>
                                        <small className="text-red-800 font-semibold">
                                            Passenger:{" "}
                                            <span className="text-gray-700 font-black">
                                            {vehicle.seatNumber}
                                            </span>
                                        </small>
                                        <small className="text-red-800 font-semibold">
                                            Contact:{" "}
                                            <span className="text-gray-700 font-black">
                                            {driver.contact}
                                            </span>
                                        </small>

                                        <small
                                            onClick={() =>
                                            handleComplain(driver.driverName, vehicle)
                                            }
                                            className="cursor-pointer text-blue-600 underline hover:text-blue-800 transition-all duration-300 ease-in-out"
                                        >
                                            Complain!
                                        </small>

                                        <button
                                            onClick={() => handleDriverSelect(driver, vehicle)}
                                            className="w-full text-center text-white rounded-lg font-semibold p-2 bg-blue-800 hover:bg-blue-700 transition-all duration-300 ease-in-out"
                                        >
                                            Select
                                        </button>
                                        </div>
                                    </div>
                                    ))
                                )
                                )}
          
                            </div>
                        )}
                    </div>

                    {/* Complain about selected driver */}
                    <div id="complain" className="mt-4 mb-12 w-full">
                        {selectDriver && (
                            <div className="relative flex flex-col mb-1 w-full rounded-lg py-1 px-2 bg-red-100">
                                <span 
                                    onClick={() => setSelectDriver("")} 
                                    className="absolute top-2 right-2 sm:right-4 text-red-900 sm:text-xl cursor-pointer"
                                >
                                    ✖️
                                </span>
                                <p className="underline font-bold">Complain about this driver:</p>
                                <small className="text-red-800 font-semibold">
                                    Driver & Vehicle: <span className="text-gray-700 font-black">{selectDriver}</span>
                                </small>
                                {selectedDriver && (
                                    <small className="text-red-800 font-semibold">
                                        Contact: <span className="text-gray-700 font-black">{selectedDriver.contact}</span>
                                    </small>
                                )}
                            </div>
                        )}
                        <a 
                            href="mailto:nomopoventures@yahoo.com" 
                            className={`text-center block w-full rounded-lg py-3 ${
                                selectDriver === "" ? "cursor-not-allowed bg-gray-500" : "bg-[#3688EE] hover:bg-blue-800 transition-all duration-300 ease-in-out"
                            } text-white font-semibold`}
                        >
                            Lodge Complain!
                        </a>
                    </div>
                </div>
            </div>

            {
                //Driver's Information Display
                driverInfo && selectedDriver && selectedVehicle && (
                    <div className="p-1 sm:p-6 py-3 absolute left-0 lg:left-80 top-6 w-full max-w-[900px] mx-auto bg-[rgba(0,0,0,0.85)] text-gray-200 rounded-sm">
                        
                        {/* close page button */}
                        <div className="m-2 text-right"> 
                            <span 
                                onClick={() => setDriverInfo(false)} 
                                className="cursor-pointer text-left p-2 bg-red-600 rounded-lg hover:bg-red-800"
                            >
                                ✖️
                            </span>
                        </div>

                        {/* Nav for the Drivers Information */}
                        <div className="flex gap-1 justify-between items-center border-b border-gray-400">
                            {/* Driver's Profile image */}
                            <Image 
                                src={"/per.png"} 
                                alt="Driver's profile picture"
                                width={100}
                                height={100}
                                className="m-1 w-28 h-28 sm:w-36 sm:h-36 rounded-full"
                            />

                            {/* Driver contact and verification status */}
                            <div className="sm:items-center flex flex-col gap-2 font-semibold m-1 p-2 sm:px-30 bg-gray-900 rounded-lg">
                                {/* driver name */}
                                <h1 className="text-[14px]">{selectedDriver.driverName}</h1>
                                <h2 className="font-normal text-gray-400 text-[12px]"><span className="font-bold">Location:{" "}</span>{selectedDriver.location}</h2>
                                {/* driver contact */}
                                <Link href={`https://wa.me/+234${selectedDriver.contact}`} target="_blank" rel="noopener noreferrer" className="text-[goldenrod]">
                                    <i className="fa fa-phone" style={{fontSize:"20px"}}></i> {selectedDriver.contact}
                                </Link>
                                
                                {/* driver verification status */}
                                <div className="font-black flex gap-1 ">
                                    Status: 
                                    {selectedDriver.status ? (
                                        <>
                                            <span className="text-green-300 font-normal">Verified</span>
                                            <i className="text-green-300 fa fa-check-square" style={{fontSize:"20px"}}></i>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-gray-500 font-normal">Unverified</span>
                                            <i className="text-gray-500 fa fa-check-square" style={{fontSize:"20px"}}></i>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Reviews and Car Images */}
                        <div className="p-1 pb-10 flex flex-col sm:flex-row gap-2">

                            {/* Car images view and thumbnail*/}
                            <div className="flex-2 flex flex-col gap-1">
                                {/* card list of cars owned by driver */}
                                <div className="flex p-1 rounded-t-lg bg-black">
                                    <small className="font-semibold text-white m-2">
                                        Vehicle Log 
                                        <span className="text-[goldenrod]">{" >>>"}</span>
                                    </small>

                                    {/*Car top card button to view different cars owned by driver*/}
                                    <div className="p-2 flex-2 flex overflow-x-auto">
                                        {selectedDriver.vehicleLog.map((vehicle, idx) => {
                                            return(
                                                //click to change car log
                                                <div 
                                                    onClick={() => { 
                                                        setSelectedVehicle(vehicle); 
                                                        setMainImage(vehicle.pictures[0]); 
                                                    }} 
                                                    key={idx} 
                                                    className={`cursor-pointer hover:bg-red-800 hover:text-white transition ease-in-out mx-1 rounded-2xl px-3 ${
                                                        selectedVehicle.id === vehicle.id ? 'bg-red-800 text-white' : 'text-black bg-gray-200'
                                                    }`}
                                                >
                                                    <small>{vehicle.carMake} {vehicle.carType}</small>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* car image main view */}
                                <Image
                                    src={mainImage}
                                    alt="Car Image"
                                    width={400}
                                    height={400}
                                    className="w-full mx-auto"
                                />

                                {/* Car spec Info */}
                                <div className="flex flex-col text-center bg-blue-100 rounded-b-lg p-2 text-gray-900">
                                    <small>
                                        Car Model:{" "} 
                                        <span className="font-black text-red-900">
                                            {selectedVehicle.carMake} {selectedVehicle.carModel}{" "}
                                        </span>
                                        <span className="font-black text-gray-500 underline">
                                            {selectedVehicle.carType}
                                        </span>
                                    </small>
                                    <small>
                                        Seat Number:{" "} 
                                        <span className="font-black text-red-900">
                                            {selectedVehicle.seatNumber}{" "}
                                        </span>
                                    </small>
                                    <small>
                                        Color:{" "} 
                                        <span className="font-black text-red-900">
                                            {selectedVehicle.color}{" "}
                                        </span>
                                    </small>
                                    <small>
                                        AC:{" "} 
                                        <span className="font-black text-red-900">
                                            {selectedVehicle.ac}{" "}
                                        </span>
                                    </small>
                                </div>

                                {/* thumbnail view */}
                                <div className="border-t border-gray-400 p-3 flex justify-center gap-4 ">
                                    {selectedVehicle.pictures.map((img, idx) => {
                                        return(
                                            <div 
                                                key={idx} 
                                                onClick={() => setMainImage(img)} 
                                                className={`overflow-hidden border-3 ${
                                                    mainImage === img ? "border-red-700" : "border-gray-300"
                                                } rounded-lg cursor-pointer`}
                                            >
                                                <Image 
                                                    src={img}
                                                    alt="car thumbnail"
                                                    width={50}
                                                    height={50}
                                                    className="w-20 h-20 object-fill"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Driver review messages and form to write review */}
                            <div className="flex-1 w-full p-1">
                                {/* Review header */}
                                <h2 className="pt-3 mb-2 font-bold border-b-4 border-gray-200">Reviews</h2>

                                {/* Reviews */}
                                <div className="h-[40vh] sm:h-[50vh] overflow-y-auto flex flex-col gap-2 items-left text-gray-800">
                                    {selectedDriver.reviews.map((review, idx) => {
                                        return(
                                            <div key={idx} className="p-2 flex flex-col gap-1 rounded-lg bg-gray-100">
                                                <p className="font-bold text-red-900">
                                                    {review.commenterName}{" "} 
                                                    <small className="font-normal text-red-500 text-[10px] underline">
                                                        {review.comenterEmail}
                                                    </small>
                                                </p>
                                                <small className="p-1 rounded bg-white">{review.comment}</small>
                                                <small className="text-[10px] text-gray-500 font-semibold">
                                                    {review.dateAndTime}
                                                </small>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* form to write review */}
                                {driverInfo && selectedDriver && selectedVehicle && (
                                    <div className="mt-5 p-1 bg-blue-900 rounded">
                                        {/* Display message */}
                                        {reviewMessage.text && (
                                            <div className={`mb-2 p-2 text-center rounded font-medium ${reviewMessage.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                                                {reviewMessage.text}
                                            </div>
                                        )}

                                        <form onSubmit={handleReviewSubmit}>
                                            <input 
                                                className="mb-3 outline-none rounded w-full bg-white text-gray-800 p-1 px-2" 
                                                type="text" 
                                                name="name" 
                                                placeholder="Name" 
                                                value={reviewForm.name}
                                                onChange={handleReviewChange}
                                                required
                                            />

                                            <input 
                                                className="mb-3 outline-none rounded w-full bg-white text-gray-800 p-1 px-2" 
                                                type="email" 
                                                name="email" 
                                                placeholder="Email" 
                                                value={reviewForm.email}
                                                onChange={handleReviewChange}
                                                required
                                            />
                                            
                                            <textarea 
                                                className="outline-none rounded w-full bg-white text-gray-800 p-2" 
                                                name="comment" 
                                                rows={2} 
                                                maxLength={250} 
                                                placeholder="Comment" 
                                                value={reviewForm.comment}
                                                onChange={handleReviewChange}
                                                required
                                            ></textarea>
                                            <button 
                                                type="submit" 
                                                className="font-semibold w-full bg-blue-200 rounded mt-2 hover:bg-blue-300 text-blue-900 p-2"
                                            >
                                                Post Comment
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}