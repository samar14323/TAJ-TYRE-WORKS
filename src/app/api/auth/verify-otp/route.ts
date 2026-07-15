import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ success: false, error: "Phone and verification code are required." }, { status: 400 });
    }

    // Find the latest active OTP for this phone
    const dbOtp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!dbOtp) {
      return NextResponse.json({ success: false, error: "No active verification code found." }, { status: 404 });
    }

    const now = new Date();

    // Check lockout: if attempts >= 3 and within 5 minutes, block verify
    if (dbOtp.attempts >= 3 && now.getTime() - dbOtp.createdAt.getTime() < 300000) {
      const waitMins = Math.ceil((300000 - (now.getTime() - dbOtp.createdAt.getTime())) / 60000);
      return NextResponse.json({
        success: false,
        error: `Too many failed attempts. Verification locked. Retry in ${waitMins} minute(s).`
      }, { status: 403 });
    }

    // Expiry Check
    if (now.getTime() > dbOtp.expiresAt.getTime()) {
      return NextResponse.json({ success: false, error: "Verification code expired. Please request a new code." }, { status: 410 });
    }

    // Single-use Check
    if (dbOtp.used) {
      return NextResponse.json({ success: false, error: "Verification code already used." }, { status: 410 });
    }

    // Verification Match
    if (dbOtp.code === code) {
      // Mark OTP as used to prevent reuse
      await prisma.otp.update({
        where: { id: dbOtp.id },
        data: { used: true },
      });

      // Find or create customer
      let customer = await prisma.customer.findUnique({
        where: { phone }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            id: `c-${Date.now()}`,
            name: `Client (${phone})`,
            phone,
            trustLevel: "Bronze"
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: "Verification successful.",
        customerName: customer.name,
        customerId: customer.id
      });
    } else {
      // Increment attempts
      await prisma.otp.update({
        where: { id: dbOtp.id },
        data: { attempts: { increment: 1 } },
      });

      const attemptsLeft = 3 - (dbOtp.attempts + 1);
      const errorMsg = attemptsLeft > 0
        ? `Invalid code. ${attemptsLeft} attempts left before lock.`
        : "Too many failed attempts. Verification locked for 5 minutes.";

      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
