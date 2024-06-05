import { NextResponse } from "next/server";

export const serviceUnavailable: NextResponse = NextResponse.json(null, {status: 503})
export const noContent: Response = new Response(null, {status: 204})