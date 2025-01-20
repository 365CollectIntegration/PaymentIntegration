import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";
import { gpAxios } from "@/utils/apiUtils";

export async function GET() {
  try {
    const res = await gpAxios.post(
      "/tokens",
      { scope: "securepanel" },
      {
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_GLOBAL_PAYMENT_API_KEY,
          "x-idempotency-key": uuid(),
        },
      }
    );

    return NextResponse.json({ token: res.data.token ?? "" }, { status: 200 });
  } catch (error) {
    console.log("ERROR: ", error);
    return NextResponse.json(
      { message: "Something went wrong in getting the token" },
      { status: 500 }
    );
  }
}
