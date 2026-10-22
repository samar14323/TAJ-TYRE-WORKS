import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = (body.token || "").trim();
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Password reset token is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Password and Confirm Password do not match." },
        { status: 400 }
      );
    }

    // Locate recovery request with this resetToken
    const request = await prisma.accountRecoveryRequest.findUnique({
      where: { resetToken: token },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Invalid password reset token." },
        { status: 404 }
      );
    }

    if (request.status !== "Approved") {
      return NextResponse.json(
        { success: false, error: "This recovery request has not been approved by workshop management." },
        { status: 403 }
      );
    }

    if (request.resetCompleted) {
      return NextResponse.json(
        { success: false, error: "This password reset token has already been used. Please log in or request a new reset." },
        { status: 410 }
      );
    }

    if (!request.resetTokenExpiry || new Date() > request.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, error: "This password reset token has expired. Please submit a new recovery request." },
        { status: 410 }
      );
    }

    if (!request.customerId || !request.customer) {
      return NextResponse.json(
        { success: false, error: "Customer account linked to this token could not be found." },
        { status: 404 }
      );
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update customer record
    const updatedCustomer = await prisma.customer.update({
      where: { id: request.customerId },
      data: {
        password: hashedPassword,
      },
    });

    // Mark reset as completed to invalidate token
    await prisma.accountRecoveryRequest.update({
      where: { id: request.id },
      data: {
        resetCompleted: true,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "COMPLETE_PASSWORD_RESET",
          entity: "Customer",
          entityId: updatedCustomer.id,
          newValue: JSON.stringify({
            username: updatedCustomer.username,
            requestId: request.requestId,
          }),
        },
      });
    } catch (e) {
      console.warn("Audit log notice:", e);
    }

    console.log(`[PASSWORD RESET SUCCESS] Customer "${updatedCustomer.name}" (${updatedCustomer.username}) successfully updated password via token.`);

    return NextResponse.json({
      success: true,
      message: "Password reset completed successfully. You can now log in with your new password.",
      username: updatedCustomer.username,
      name: updatedCustomer.name,
      phone: updatedCustomer.phone,
    });
  } catch (error: any) {
    console.error("[RESET PASSWORD ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
