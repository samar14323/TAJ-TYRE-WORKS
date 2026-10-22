import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = (body.phone || "").replace(/\D/g, "");
    const code = (body.code || "").trim();
    const username = (body.username || "").trim();
    const password = body.password || "";
    const name = (body.name || "").trim();

    // 1. Basic validation
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "A valid 10-digit mobile number is required." },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "A 6-digit verification code is required." },
        { status: 400 }
      );
    }

    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, error: "Username must be between 3 and 30 characters." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return NextResponse.json(
        { success: false, error: "Username can only contain letters, numbers, hyphens, and underscores." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    // 2. Validate OTP code
    const dbOtp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!dbOtp) {
      return NextResponse.json(
        { success: false, error: "No active verification code found. Please request a new OTP." },
        { status: 404 }
      );
    }

    const now = new Date();

    if (dbOtp.attempts >= 3 && now.getTime() - dbOtp.createdAt.getTime() < 300000) {
      const waitMins = Math.ceil((300000 - (now.getTime() - dbOtp.createdAt.getTime())) / 60000);
      return NextResponse.json(
        { success: false, error: `Too many failed attempts. Verification locked. Retry in ${waitMins} minute(s).` },
        { status: 403 }
      );
    }

    if (now.getTime() > dbOtp.expiresAt.getTime()) {
      return NextResponse.json(
        { success: false, error: "Verification code expired. Please request a new code." },
        { status: 410 }
      );
    }

    if (dbOtp.used) {
      return NextResponse.json(
        { success: false, error: "Verification code has already been used. Please request a new one." },
        { status: 410 }
      );
    }

    if (dbOtp.code !== code) {
      await prisma.otp.update({
        where: { id: dbOtp.id },
        data: { attempts: { increment: 1 } },
      });
      const attemptsLeft = 3 - (dbOtp.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          error: attemptsLeft > 0
            ? `Invalid verification code. ${attemptsLeft} attempt(s) remaining.`
            : "Too many failed attempts. Locked for 5 minutes.",
        },
        { status: 400 }
      );
    }

    // 3. Ensure username is not already taken by another Customer
    const customerWithUsername = await prisma.customer.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        NOT: { phone },
      },
    });

    if (customerWithUsername) {
      return NextResponse.json(
        { success: false, error: `Username "${username}" is already taken. Please choose a different username.` },
        { status: 409 }
      );
    }

    // Check reserved usernames against Owner, Employee, Dealer tables
    const [ownerMatch, employeeMatch, dealerMatch] = await Promise.all([
      prisma.owner.findUnique({ where: { username } }),
      prisma.employee.findUnique({ where: { username } }),
      prisma.dealer.findUnique({ where: { username } }),
    ]);

    if (ownerMatch || employeeMatch || dealerMatch) {
      return NextResponse.json(
        { success: false, error: `Username "${username}" is reserved. Please pick another username.` },
        { status: 409 }
      );
    }

    // 4. Mark OTP as used
    await prisma.otp.update({
      where: { id: dbOtp.id },
      data: { used: true },
    });

    // 5. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Reuse existing Customer record or create new
    let customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (customer) {
      // Update existing record
      customer = await prisma.customer.update({
        where: { phone },
        data: {
          username,
          password: hashedPassword,
          ...(name && !customer.name ? { name } : {}),
        },
      });
      console.log(`[CUSTOMER AUTH] Activated account for existing customer "${customer.name}" (${phone}) with username "${username}"`);
    } else {
      // Create new customer record
      customer = await prisma.customer.create({
        data: {
          id: `c-${Date.now()}`,
          name: name || `Customer (${phone})`,
          phone,
          username,
          password: hashedPassword,
          trustLevel: "Bronze",
        },
      });
      console.log(`[CUSTOMER AUTH] Created new customer account for "${customer.name}" (${phone}) with username "${username}"`);
    }

    return NextResponse.json({
      success: true,
      message: "Password configured and account activated successfully.",
      name: customer.name,
      username: customer.username,
      phone: customer.phone,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error("[CUSTOMER ACTIVATION ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to set up account credentials." },
      { status: 500 }
    );
  }
}
