import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const httpMethodMap: { [key: string]: number } = {
    GET: 179050000,
    POST: 179050001,
    PATCH: 179050002,
    PUT: 179050003,
    DELETE: 179050004,
    CONNECT: 179050005,
    TRACE: 179050006,
    OPTIONS: 179050007,
    HEAD: 179050008,
  };

  try {
    const res = await collectAxios.post(
      `/api/data/v9.2/mec_apitransactionlogs`,
      {
        mec_apitransactionlogidentifier: body.logid,
        "mec_CustomerRequestID@odata.bind": `/mec_customerrequests(${body.mec_customerrequestid})`,
        mec_apiendpoint: body.apiurl,
        mec_httpmethod: httpMethodMap[body.method.toUpperCase()],
        mec_httpstatuscode: body.status_code,
        mec_httpstatusmessage: body.message,
        mec_requestbody: JSON.stringify(body.request_body),
        mec_responsebody: JSON.stringify(body.response_body),
        mec_requesttimestamp: new Date(
          Date.UTC(2025, 1, 5, 0, 44, 54)
        ).toISOString(),
        mec_responsestatus: body.response_status,
        mec_responsecode: body.response_code,
        mec_responsemessage: body.response_message,
      },
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
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
