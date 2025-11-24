// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "No token provided" }, { status: 400 });
        }

        // Verify token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(idToken);

        // Set HTTP-only cookie
        const response = NextResponse.json({ 
        message: "Logged in successfully",
        uid: decodedToken.uid 
        });
        
        response.cookies.set({
        name: "token",
        value: idToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
        
    } catch (err) {
        console.error("Login API error:", err);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}