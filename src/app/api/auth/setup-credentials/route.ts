import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = (body.token || "").trim();
    const username = (body.username || "").trim();
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    // 1. Verify token
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Setup activation token is required." },
        { status: 400 }
      );
    }

    const tokenRecord = await prisma.activationToken.findUnique({
      where: { token },
      include: { customer: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or unrecognized activation token." },
        { status: 404 }
      );
    }

    if (tokenRecord.used) {
      return NextResponse.json(
        { success: false, error: "This setup link has already been used. Please log in with your credentials." },
        { status: 410 }
      );
    }

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json(
        { success: false, error: "This setup link has expired. Please sign up or request activation again." },
        { status: 410 }
      );
    }

    // 2. Validate Username
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, error: "Username must be between 3 and 30 characters in length." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return NextResponse.json(
        { success: false, error: "Username can only contain alphanumeric characters, hyphens, and underscores." },
        { status: 400 }
      );
    }

    // Check username availability across Customer, Owner, Employee, Dealer
    const [existingCustomerUser, existingOwner, existingEmployee, existingDealer] = await Promise.all([
      prisma.customer.findFirst({
        where: {
          username: { equals: username, mode: "insensitive" },
          NOT: { id: tokenRecord.customerId },
        },
      }),
      prisma.owner.findUnique({ where: { username } }),
      prisma.employee.findUnique({ where: { username } }),
      prisma.dealer.findUnique({ where: { username } }),
    ]);

    if (existingCustomerUser || existingOwner || existingEmployee || existingDealer) {
      return NextResponse.json(
        { success: false, error: `The username "${username}" is already taken. Please choose another username.` },
        { status: 409 }
      );
    }

    // 3. Validate Password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Password and Confirm Password do not match." },
        { status: 400 }
      );
    }

    // 4. Secure server-side bcrypt password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Update Customer record
    const updatedCustomer = await prisma.customer.update({
      where: { id: tokenRecord.customerId },
      data: {
        username,
        password: hashedPassword,
      },
    });

    // 6. Invalidate activation token
    await prisma.activationToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    console.log(`[CREDENTIALS SETUP] User "${username}" successfully activated for Customer "${updatedCustomer.name}" (${updatedCustomer.phone})`);

    return NextResponse.json({
      success: true,
      message: "Credentials successfully created. You can now access your dashboard.",
      name: updatedCustomer.name,
      username: updatedCustomer.username,
      phone: updatedCustomer.phone,
      customerId: updatedCustomer.id,
    });
  } catch (error: any) {
    console.error("[SETUP CREDENTIALS ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to set up credentials." },
      { status: 500 }
    );
  }
}
