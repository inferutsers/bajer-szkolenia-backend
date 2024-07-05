import BIR11NipSearch from '@/functions/bir11/complete'
import { NextResponse } from 'next/server'

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const nipdata = await BIR11NipSearch("5250011881")
    return NextResponse.json(nipdata)
}