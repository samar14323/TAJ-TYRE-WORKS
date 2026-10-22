import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = (body.requestId || "").trim().toUpperCase();
    const phone = (body.phone || "").replace(/\D/g, "");

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Please enter your Request ID (e.g. REC-2026-XXXXX)." },
        { status: 400 }
      );
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter the 10-digit mobile number used in the request." },
        { status: 400 }
      );
    }

    // Look up request strictly matching BOTH requestId and phone (prevents snooping other requests)
    const request = await prisma.accountRecoveryRequest.findFirst({
      where: {
        requestId,
        phone,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error: "No recovery request found matching this Request ID and Mobile Number. Please verify your details.",
        },
        { status: 404 }
      );
    }

    const responseData: any = {
      success: true,
      requestId: request.requestId,
      type: request.type,
      status: request.status,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      adminNote: request.adminNote,
    };

    if (request.status === "Approved") {
      if (request.type === "FORGOT_USERNAME") {
        responseData.username = request.customer?.username || null;
      } else if (request.type === "FORGOT_PASSWORD") {
        const isTokenValid =
          request.resetToken &&
          !request.resetCompleted &&
          request.resetTokenExpiry &&
          new Date() < request.resetTokenExpiry;

        responseData.resetCompleted = request.resetCompleted;
        responseData.isTokenValid = isTokenValid;
        if (isTokenValid) {
          responseData.resetToken = request.resetToken;
        }
      } else if (request.type === "CHANGE_USERNAME") {
        responseData.updatedUsername = request.desiredUsername;
      }
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[RECOVERY STATUS ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to look up request status." },
      { status: 500 }
    );
  }
}
