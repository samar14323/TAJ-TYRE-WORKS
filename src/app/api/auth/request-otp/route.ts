import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ success: false, error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Rate limiting: check if an OTP was requested for this phone in the last 30 seconds
    const lastOtp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    if (lastOtp && now.getTime() - lastOtp.createdAt.getTime() < 30000) {
      const waitSecs = Math.ceil((30000 - (now.getTime() - lastOtp.createdAt.getTime())) / 1000);
      return NextResponse.json({
        success: false,
        error: `Please wait ${waitSecs} second(s) before requesting another OTP.`
      }, { status: 429 });
    }

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiry

    // Save OTP to database
    await prisma.otp.create({
      data: {
        phone,
        code,
        expiresAt,
        used: false,
        attempts: 0
      }
    });

    console.log(`[SMS GATEWAY - NEON] Dispatched OTP code to Customer (+91 ${phone}): ${code}`);

    return NextResponse.json({
      success: true,
      message: "OTP dispatched successfully.",
      otp: code
    });
  } catch (error: any) {
    console.error("request-otp error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
