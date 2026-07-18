import { NextResponse } from "next/server";

export const mockUser = {
  id: "c61c855c-0019-414c-bb6d-6da106ae7fb4", // The owner ID from database seed
  name: "MP Owner",
  email: "owner@mpdigital.in",
  role: "owner",
};

export const mockSession = {
  user: mockUser,
  expires: "2099-01-01T00:00:00.000Z",
};

// Mock server-side auth
export async function auth() {
  return mockSession;
}

// Mock handlers for next-auth API requests (GET/POST /api/auth/session)
export const handlers = {
  async GET(req: Request) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/session")) {
      return NextResponse.json(mockSession);
    }
    return NextResponse.json({});
  },
  async POST() {
    return NextResponse.json(mockSession);
  },
};

export async function signIn() {
  return { error: null, url: "/" };
}

export async function signOut() {
  return { error: null, url: "/login" };
}
