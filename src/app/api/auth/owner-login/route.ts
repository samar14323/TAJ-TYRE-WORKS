import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const isDev = process.env.NODE_ENV !== "production";
  let username = "";
  try {
    const body = await req.json();
    username = body.username;
    const password = body.password;

    console.log(`[AUTH AUDIT] Received login request for username: "${username}"`);

    if (!username || !password) {
      console.log(`[AUTH AUDIT] Failure: Missing username or password`);
      return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
    }

    // 1. Try Owner lookup
    const owner = await prisma.owner.findUnique({
      where: { username }
    });

    if (owner) {
      console.log(`[AUTH AUDIT] Found matching record in Owner table for username: "${username}"`);
      const match = await bcrypt.compare(password, owner.password);
      console.log(`[AUTH AUDIT] Bcrypt comparison result for Owner: ${match}`);
      
      if (match) {
        console.log(`[AUTH AUDIT] Success: Authenticated Owner: "${username}"`);
        return NextResponse.json({
          success: true,
          role: "Owner",
          name: owner.name,
          username: owner.username
        });
      } else {
        console.log(`[AUTH AUDIT] Failure: Incorrect password for Owner: "${username}"`);
        return NextResponse.json({
          success: false,
          error: isDev ? "Incorrect password for Owner account." : "Invalid credentials."
        }, { status: 401 });
      }
    }

    // 2. Try Employee lookup
    const employee = await prisma.employee.findUnique({
      where: { username }
    });

    if (employee) {
      console.log(`[AUTH AUDIT] Found matching record in Employee table for username: "${username}"`);
      const match = await bcrypt.compare(password, employee.password);
      console.log(`[AUTH AUDIT] Bcrypt comparison result for Employee: ${match}`);
      
      if (match) {
        console.log(`[AUTH AUDIT] Success: Authenticated Employee: "${username}"`);
        return NextResponse.json({
          success: true,
          role: "Employee",
          name: employee.name,
          username: employee.username,
          employeeRole: employee.role
        });
      } else {
        console.log(`[AUTH AUDIT] Failure: Incorrect password for Employee: "${username}"`);
        return NextResponse.json({
          success: false,
          error: isDev ? "Incorrect password for Employee account." : "Invalid credentials."
        }, { status: 401 });
      }
    }

    // 3. Try Dealer lookup
    const dealer = await prisma.dealer.findUnique({
      where: { username }
    });

    if (dealer) {
      console.log(`[AUTH AUDIT] Found matching record in Dealer table for username: "${username}"`);
      const match = await bcrypt.compare(password, dealer.password);
      console.log(`[AUTH AUDIT] Bcrypt comparison result for Dealer: ${match}`);
      
      if (match) {
        console.log(`[AUTH AUDIT] Success: Authenticated Dealer: "${username}"`);
        return NextResponse.json({
          success: true,
          role: "Dealer",
          name: dealer.name,
          username: dealer.username
        });
      } else {
        console.log(`[AUTH AUDIT] Failure: Incorrect password for Dealer: "${username}"`);
        return NextResponse.json({
          success: false,
          error: isDev ? "Incorrect password for Dealer account." : "Invalid credentials."
        }, { status: 401 });
      }
    }

    console.log(`[AUTH AUDIT] Failure: Username "${username}" not found in Owner, Employee, or Dealer tables.`);
    return NextResponse.json({
      success: false,
      error: isDev ? `Username "${username}" not found.` : "Invalid credentials."
    }, { status: 401 });

  } catch (error: any) {
    console.error(`[AUTH AUDIT] Exception during auth flow for username "${username}":`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
