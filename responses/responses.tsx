import { NextResponse } from "next/server";

export const serviceUnavailable: Response = new Response(null, {status: 503})
export const noContent: Response = new Response(null, {status: 204})
export const badRequest: Response = new Response(null, {status: 400})
export const notFound: Response = new Response(null, {status: 404})
export const notAllowed: Response = new Response(null, {status: 405})
export const notAcceptable: Response = new Response(null, {status: 406})
export const unprocessableContent: Response = new Response(null, {status: 422})
export const unauthorized: Response = new Response(null, {status: 401})