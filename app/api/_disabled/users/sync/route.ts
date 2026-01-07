import { NextResponse } from "next/server";

// Simple in-memory storage for syncing users across ports
// In production, use a real database
let sharedUsers: any[] = [];

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET() {
  return NextResponse.json(
    { users: sharedUsers },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.users && Array.isArray(body.users)) {
      sharedUsers = body.users;
      console.log("📡 API: Received users sync, count:", sharedUsers.length);
      return NextResponse.json(
        { success: true, count: sharedUsers.length },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }
    return NextResponse.json(
      { success: false, error: "Invalid data" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

