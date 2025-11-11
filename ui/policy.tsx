"use client";

export default function PolicyPageUi() {
    // Automatically generate today's date
    const lastUpdated = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="px-6 py-8 max-w-5xl mx-auto">
            <h1 className="text-3xl text-gray-600 font-bold mb-4">Privacy & Policy</h1>
            <p className="text-gray-700 mb-6">
                Welcome to our platform! Your trust is our priority. This policy outlines 
                how we collect, use, and protect your data, as well as your rights as a user.
            </p>

            {/* Data Collection */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">1. Data Collection</h2>
                <p className="text-gray-700">
                We collect information that you provide directly, such as your name, 
                email, phone number, vehicle details, and uploaded images. We may also 
                collect usage data to improve our services.
                </p>
            </section>

            {/* Use of Information */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">2. Use of Information</h2>
                <p className="text-gray-700">
                Your information is used to provide and improve our services, process 
                bookings, communicate with you, and ensure a safe and reliable experience 
                for all users.
                </p>
            </section>

            {/* Sharing Data */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">3. Sharing of Data</h2>
                <p className="text-gray-700">
                We do not sell your personal information. Data may be shared with service 
                partners or legal authorities if required by law or to protect our users 
                and platform integrity.
                </p>
            </section>

            {/* User Rights */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">4. Your Rights</h2>
                <p className="text-gray-700">
                You have the right to access, update, or delete your personal information. 
                You can manage your account settings to control what information you share in your profile as a driver. 
                To delete account, Please Note{":(Drivers Only)"}, Once logged in scrooll to the footer and there you'll find delete account, follow the process to remove account parmanently.
                We do not collect personal information for users who just want to book vehicles on our page. 
                </p>
            </section>

            {/* Security */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">5. Security</h2>
                <p className="text-gray-700">
                We implement appropriate security measures to protect your data against 
                unauthorized access, alteration, disclosure, or destruction.
                </p>
            </section>

            {/* Platform Integrity */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">6. Platform Integrity</h2>
                <p className="text-gray-700">
                Our platform is committed to maintaining a safe and respectful environment. 
                Users found violating our rules or engaging in fraudulent activities may 
                have their accounts suspended or removed.
                </p>
            </section>

            {/* Contact */}
            <section className="mb-6">
                <h2 className="text-xl text-blue-900 font-semibold mb-2">7. Contact Us</h2>
                <p className="text-gray-700">
                For questions about this policy or your data, please contact us at: 
                <br />
                <strong>Email:</strong> nomopoventures@yahoo.com
                <br />
                <strong>Phone:</strong> +234 902 368 8246 
                </p>
            </section>

            {/* Footer */}
            <div className="mt-8 text-gray-500 text-sm">
                <p>Last Updated: {lastUpdated}</p>
                <p>
                &copy; {new Date().getFullYear()} NOMO CARS. All rights reserved. Our platform 
                is committed to protecting user data and ensuring fair use.
                </p>
            </div>
        </div>
    );
}
