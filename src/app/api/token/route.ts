import { NextResponse } from "next/server";
import { msAxios } from "@/utils/apiUtils";

export async function GET() {
  try {
    const res = await msAxios.post(
      `/${process.env.NEXT_PUBLIC_MICROSOFT_ONLINE_TENANT_ID}/oauth2/v2.0/token`,
      {
        grant_type: "client_credentials",
        client_id: process.env.NEXT_PUBLIC_MICROSOFT_ONLINE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_MICROSOFT_ONLINE_SECRET_KEY,
        scope: `${process.env.NEXT_PUBLIC_COLLECT_DEV_CRM6_URL}/.default`,
      },
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return NextResponse.json({ token: res.data }, { status: 200 });
  } catch (error) {
    console.log("ERROR: ", error);
    return NextResponse.json(
      { message: "Something went wrong in getting the token" },
      { status: 500 }
    );
  }
}
