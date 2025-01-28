import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  axios({
    method: "POST",
    url: `https://sandbox.api.gpaunz.com/webhooks`,
    headers: {
      Accept: "application/json, text/plain",
      "Content-Type": "application/json",
      "x-api-key":
        "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
      "x-idempotency-key": uuid(),
    },
    data: {
      event: "payment_instruments",
      url: "https://www.myapi.com/events/transactions",
    },
  })
    .then((res) => {
      return NextResponse.json(res.data, { status: 200 });
    })
    .catch(() => {
      return NextResponse.json(
        { message: "Something went wrong." },
        { status: 500 }
      );
    });
}
