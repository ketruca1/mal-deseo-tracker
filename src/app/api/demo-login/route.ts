import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

const SECRET = process.env.NEXTAUTH_SECRET || "mal-deseo-launch-tracker-secret-2025";

export async function POST() {
  try {
    // Create a JWT token using NextAuth's own encode function
    const token = await encode({
      token: {
        sub: "demo-user",
        name: "Kevin Cano",
        email: "kevin@mal-deseo.com",
        picture: null,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      },
      secret: SECRET,
    });

    const cookieStore = await cookies();
    cookieStore.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: { name: "Kevin Cano", email: "kevin@mal-deseo.com" },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}