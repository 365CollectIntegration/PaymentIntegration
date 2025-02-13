import { v4 as uuid } from "uuid";
import { NextResponse, NextRequest } from "next/server";
import { gpAxios } from "@/utils/apiUtils";
import appInsights from '@/utils/appInsights';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    appInsights.trackTrace({ message: "Create Transaction from 365 received", properties: { body } });

    const res = await gpAxios.post(
      "/transactions",
      {
        reference: body.reference,
        redirectUrl: body.redirectUrl,
        category: body?.category || null,
        payment: body.payment,
        payer: body?.payer || null,
      },
      {
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_GLOBAL_PAYMENT_API_KEY,
          "x-idempotency-key": uuid(),
        },
      }
    );

    const responseData = res.data;
    appInsights.trackTrace({ message: "Transaction has been created.", properties: {  responseData } });
    return NextResponse.json({ responseData }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ message: error }, { status: 500 });
  }
}
