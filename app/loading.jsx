"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-white text-blue-800">
            {/* Logo or App Name */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
            >
                {/* Optional logo */}
                <Image
                src="/logo.png"
                alt="App Logo"
                width={80}
                height={80}
                className="mb-4 rounded-full"
                />

                <h1 className="text-2xl font-semibold tracking-wide">Loading your experience...</h1>
            </motion.div>

            {/* Spinner */}
            <motion.div
                className="mt-8 w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
            />

            {/* Subtext */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-6 text-sm text-gray-600"
            >
                Please wait a moment...
            </motion.p>
        </div>
    );
}
