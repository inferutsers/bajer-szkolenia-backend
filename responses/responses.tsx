import { NextResponse } from "next/server";

export const serviceUnavailable: NextResponse = NextResponse.json("Service Unavailable", {status: 503})
export const noContent: NextResponse = NextResponse.json("No Content", {status: 503})