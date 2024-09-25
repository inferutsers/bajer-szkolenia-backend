'use server'

import { rm001001 } from "@/responses/messages"
import { badRequest } from "@/responses/responses"

export async function GET(){ return badRequest(rm001001) }