import Link from "next/link"
import Image from "next/image"

export default function HomePageUi(){
    return(
        <div className="text-center p-4  bg-[#F9FAF9]">
            <div className="mx-auto my-[2rem] max-w-[40rem] bg-white rounded-lg px-6 py-6">

                {/* Home page Title */}
                <div className="text-center">
                    <h1 className="text-xl md:text-4xl text-gray-600 font-extrabold">Welcome To Nomo Car Hire</h1>
                    <small className="font-semibold text-green-800">Best service in transportation and logistics...Conecting you with the right vehicle</small>
                </div>
                <Image
                 src={"/art.jpg"}
                 alt="Home Hero Image"
                 width={300}
                 height={300}
                 className="rounded-lg my-2 mx-auto"
                />

                {/* Registraion and Log in and Car Hire Buttons */}
                <div className="sm:mx-30 mb-3 sm:mb-1  flex flex-col gap-6 justify-center items-center mt-4">
                    {/* Hire a car button */}
                    <Link href={"/book"} className="cursor-pointer w-full rounded-lg py-3 bg-blue-600 text-white font-semibold hover:bg-blue-800  transition-all duration-300 ease-in-out">Hire a Car</Link>
                    
                    {/* Register as driver button */}
                    <Link href={"/registration"} className="cursor-pointer w-full rounded-lg py-3 border-2 border-gray-400 text-black font-semibold hover:bg-gray-200  transition-all duration-300 ease-in-out">Register as a Driver</Link>
                </div>

                <div className="sm:mx-30 px-4 py-1 rounded-md bg-gray-100 mx-auto mb-12 flex justify-between items-center gap-2 font-semibold">
                    <small className="text-gray-600">Already a Driver ?.......</small>
                    {/* Log in as driver button */}
                    <Link href={"/login"} className="underline text-l text-gray-700 hover:text-black transition-all duration-300 ease-in-out">Login</Link>
                </div>

            </div>
            
        </div>
    )
}