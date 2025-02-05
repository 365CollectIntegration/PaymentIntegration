import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await collectAxios.get(
      `/api/data/v9.2/mec_customerrequests?$filter=mec_name eq '${body.reference}'&$expand=mec_PaymentArrangement($select=mec_paymentfrequency,mec_promiseamount,mec_numberofpayments,mec_firstpromisedate,mec_lastpromisedate,mec_finalpaymentamount,mec_totalamount,mec_referencenumber,mec_gppaymentinstrumentid), mec_RequestedBy ($select=_mec_contact_value), mec_Payment($select=mec_duedate, mec_referencenumber, mec_amountpaid)`,
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
      {
        message:
          "Something went wrong. We seem to be having an issue. Please try again later.",
      },
      { status: 500 }
    );
  }
}
