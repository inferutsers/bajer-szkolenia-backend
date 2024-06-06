import { NextResponse } from "next/server";

export const serviceUnavailable: Response = new Response(null, {status: 503})
export const noContent: Response = new Response(null, {status: 204})
export const badRequest: Response = new Response(null, {status: 400})