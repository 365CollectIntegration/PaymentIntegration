import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await collectAxios.get(
      `/api/data/v9.2/contacts?$filter=contactid eq ${body.contactIdValue}&$select=emailaddress1,fullname,mec_customerreferenceid,mec_gpcustomeruniqueid`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${body.token}`,
          "OData-Version": "4.0",
          "OData-MaxVersion": "4.0",
        },
      }
    );
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.log("ERROR: ", error);
    return NextResponse.json(
      { message: "Something went wrong in getting the token" },
      { status: 500 }
    );
  }
}
