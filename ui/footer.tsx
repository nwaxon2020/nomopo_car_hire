"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, LogIn, LogOut, Trash2, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { auth } from "../lib/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { User } from "firebase/auth";

export default function Footer() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    
    // Automatically generate today's date
    const lastUpdated = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }); // Update dynamically if needed

    // Determine if user is on driver-profile page
    const isDriverProfile = pathname.includes("/driver-profile");

    // Listen to authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleLoginLogout = async () => {
        if (user) {
            // User is authenticated, so sign them out
            await signOut(auth);
            // redirect to home page or login page
            router.push("/");
        } else {
            // User is not authenticated, redirect to login
            router.push("/login");
        }
    };

    return (
        <footer className="bg-gray-800 text-gray-200 px-6 py-8 shadow-inner">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Navigation Section */}
                <div>
                    <h4 className="font-bold mb-2">Navigation</h4>
                    <ul className="space-y-1">
                        <li>
                            <Link href="/" className="flex items-center gap-2 hover:text-white">
                                <Home size={16} /> Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/book" className="flex items-center gap-2 hover:text-white">
                                <BookOpen size={16} /> Book
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLoginLogout}
                                className="flex items-center gap-2 hover:text-white"
                            >
                                {user ? <LogOut size={16} /> : <LogIn size={16} />}
                                {user ? "Logout" : "Login"}
                            </button>
                        </li>
                        <li>
                            <Link href="/admin" className="flex items-center gap-2 hover:text-white">
                                <Home size={16} /> Admin
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Policy / Account Section */}
                <div>
                    <h4 className="font-bold mb-2">Account & Policy</h4>
                    <ul className="space-y-1">
                        {
                            user && <li>
                                <Link href="/delete-account" className="flex items-center gap-2 hover:text-white">
                                    <Trash2 size={16} /> Delete Account
                                </Link>
                            </li>
                        }
                        <li>
                            <Link href="/policy" className="flex items-center gap-2 hover:text-white">
                                <FileText size={16} /> Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* About / Site Info Section */}
                <div>
                    <h4 className="font-bold mb-2">About Us</h4>
                    <p className="text-sm text-gray-400 mb-2">
                        Our platform ensures reliable, safe, and transparent booking of vehicles. All drivers are verified, and we prioritize your safety.
                    </p>
                    <small>For more enquiries contact <a className="underline text-blue-400" href="mailto:nomopoventures@yahoo.com">nomopoventures@yahoo.com</a></small>
                </div>
            </div>

            {/* Bottom Line */}
            <div className="mt-6 border-t border-gray-700 pt-4 text-center text-[goldenrod] text-xs">
                &copy; {new Date().getFullYear()} NOMO CARS. All rights reserved.
                <span className="block">Last Updated: {lastUpdated}</span>
            </div>
        </footer>
    );
}