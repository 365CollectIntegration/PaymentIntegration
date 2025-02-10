import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await collectAxios.post(
      `/api/data/v9.2/mec_apitransactionlogs`,
      {        
        mec_apitransactionlogidentifier: body.logid,
        mec_customerrequestid: body.mec_customerrequestid,
        mec_apiendpoint: body.apiurl,
        mec_httpmethod: body.method,
        mec_httpstatuscode: body.status_code,
        mec_httpstatusmessage: body.message,
        mec_requestbody: body.request_body,
        mec_responsebody: body.response_body,
        mec_requesttimestamp: body.timestamp,
        mec_responsestatus: body.response_status,
        mec_responsecode: body.response_code,
        mec_responsemessage: body.response_message
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
    return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}
