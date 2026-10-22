import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  let username = "";
  try {
    const body = await req.json();
    username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Rate Limiting by IP and Username
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateLimitKey = `customer_login:${username.toLowerCase()}:${ip}`;
    const limitCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (limitCheck.isBlocked) {
      const waitMinutes = Math.ceil((limitCheck.waitSeconds || 60) / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Portal access temporarily locked. Please try again in ${waitMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    // Query Customer record by username or phone
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { phone: username },
        ],
      },
    });

    if (!customer) {
      const fail = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);
      const errorMsg = fail.isBlocked
        ? "Too many failed attempts. Portal login locked for 15 minutes."
        : `Invalid username or password.${fail.attemptsLeft <= 2 ? ` ${fail.attemptsLeft} attempt(s) remaining.` : ""}`;

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 401 }
      );
    }

    // If customer exists but has not set up a password yet
    if (!customer.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your customer account exists, but no password has been configured yet. Please click 'Activate Account / Set Password' below to set up your password.",
          needsActivation: true,
          phone: customer.phone,
        },
        { status: 403 }
      );
    }

    // Bcrypt Password Verification
    const passwordMatches = await bcrypt.compare(password, customer.password);

    if (!passwordMatches) {
      const fail = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000);
      const errorMsg = fail.isBlocked
        ? "Too many failed attempts. Portal login locked for 15 minutes."
        : `Invalid username or password.${fail.attemptsLeft <= 2 ? ` ${fail.attemptsLeft} attempt(s) remaining.` : ""}`;

      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 401 }
      );
    }

    // Clear failed attempts upon successful login
    resetRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      role: "Customer",
      name: customer.name,
      username: customer.username || customer.phone,
      phone: customer.phone,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error(`[CUSTOMER AUTH] Exception for username "${username}":`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
