/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";
import { msAxios } from "@/utils/apiUtils";
import appInsights from '@/utils/appInsights';
import { makeid } from "@/helpers/stringGenerator";

export async function POST(req: NextRequest) {
    try {

        // Get query params from the URL
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const event = searchParams.get("event");
        const token = await GetD365Token();
        const body = await req.json();

        appInsights.trackTrace({ message: `Webhook from Global Payments received with id:${id} and event: ${event}`, properties: { body } });        

        switch (event) {
            case "transactions":
                return await handleTransactions(body, token);

            case "payment_instruments":
                return await handlePaymentInstruments(body, token);

            default:
                return NextResponse.json(
                    { message: `Unhandled event type: ${body.event}` },
                    { status: 200 }
                );
        }

    } catch (error) {
        console.log("ERROR: ", error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

// Function to handle 'transactions' event
async function handleTransactions(body: any, token: string) {
    
    const status = body.payload?.result?.status;
    const paymentInstrumentId = body.payload?.payment?.instrument?.customer?.paymentInstrumentId;
    const reference = body.payload?.reference;    
    const updatedDateTime = body.payload?.updatedDateTime;
    // We need to fetch the GUID first.
    const getUrl = `/api/data/v9.2/mec_payments?$filter=mec_gppaymentinstrumentid eq '${paymentInstrumentId}' and mec_referencenumber eq '${reference}'`;
    const getResponse = await collectAxios.get(getUrl, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "OData-Version": "4.0",
            "OData-MaxVersion": "4.0",
        },
    });


    if (getResponse.data.value.length === 0) {
        // We need to log this to api that either payment instrument or reference number is invalid.
        appInsights.trackTrace({ message: "Transaction did not process.", properties: { data: getResponse.data } });

        return NextResponse.json({ message: "Transaction did not process." }, { status: 200 });
    }

    // Extract the record ID
    const recordId = getResponse.data.value[0].mec_paymentid;

    if(status != 'approved') {
        return NextResponse.json({ message: "Transaction did not process." }, { status: 200 });
    }

    // update the status in d365
    const res = await collectAxios.patch(
        `/api/data/v9.2/mec_payments(${recordId})`,
        {
            mec_paidon: updatedDateTime || new Date().toISOString(),
        },
        {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "OData-Version": "4.0",
                "OData-MaxVersion": "4.0",
            },
        }
    );

    appInsights.trackTrace({ message: "Transaction processed successfully.", properties: { data: res.data } });

    return NextResponse.json({ message: "Transaction processed successfully" }, { status: 200 });
}

// Function to handle 'payment_instruments' event
async function handlePaymentInstruments(body: any, token: string) {
    const reference = body.reference;
    const { id, payload } = body;
    // Extract relevant data from the payload
    const paymentInstrument = {
        id: payload.id,
        reference: payload.reference,
        type: payload.type,
        createdDateTime: payload.createdDateTime,
        updatedDateTime: payload.updatedDateTime,
        agreementStatus: payload.paymentAgreement?.agreementStatus,
        agreementDetails: payload.paymentAgreement?.agreementDetails,
        agreementType: payload.paymentAgreement?.agreementDetails?.frequency,
        payerName: payload.paymentAgreement?.payer?.name,
        payerType: payload.paymentAgreement?.payer?.type,
        payerAccount: payload.paymentAgreement?.payer?.account,
        payeeMerchantName: payload.paymentAgreement?.payee?.merchantName,
        resultStatus: payload.result?.status,
        resultMode: payload.result?.mode,
    };


    const entityName = paymentInstrument.agreementType == "adhoc" ? "mec_payments" : "mec_promisetopaies";
    const getUrl = `/api/data/v9.2/${entityName}?$filter=mec_gppaymentinstrumentid eq '${paymentInstrument.id}' and mec_referencenumber eq '${paymentInstrument.reference}'`;
    const getResponse = await collectAxios.get(getUrl, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "OData-Version": "4.0",
            "OData-MaxVersion": "4.0",
        },
    });

    if (getResponse.data.value.length === 0) {
        // We need to log this to api that either payment instrument or reference number is invalid.
        return NextResponse.json({ message: "Transaction did not process." }, { status: 200 });
    }

    let recordId = "";
    if (entityName == "mec_payments") {
        recordId = getResponse.data.value[0].mec_paymentid;
    }

    if (entityName == "mec_promisetopaies") {
        recordId = getResponse.data.value[0].mec_promisetopayid;
    }    

    // update the status in d365
    const res = await collectAxios.patch(
        `/api/data/v9.2/${entityName}(${recordId})`,
        // create a dynamic payload base on frequency type
        {
            // Marystela to map the field
            mec_gpagreementstatus: paymentInstrument.agreementStatus,
        },
        {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "OData-Version": "4.0",
                "OData-MaxVersion": "4.0",
            },
        }
    );
    return NextResponse.json({ message: "Payment instrument processed successfully" }, { status: 200 });
}


async function GetD365Token() {
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

        return res.data.access_token;
    } catch (error) {
        console.log("ERROR: ", error);
        return NextResponse.json(
            { message: "Something went wrong in getting the token" },
            { status: 500 }
        );
    }
}

async function apiLogging(
    token: string,
    mec_customerrequestid: string,
    apiurl: string,
    method: string,
    status_code: string,
    message?: string,
    request_body?: object,
    response_body?: object,
    response_status?: string,
    response_code?: string,
    response_message?: string
) {
    try {
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

        const res = await collectAxios.post(
            `/api/data/v9.2/mec_apitransactionlogs`,
            {
                mec_apitransactionlogidentifier: makeid(6),
                "mec_CustomerRequestID@odata.bind": `/mec_customerrequests(${mec_customerrequestid})`,
                mec_apiendpoint: apiurl,
                mec_httpmethod: httpMethodMap[method.toUpperCase()],
                mec_httpstatuscode: status_code,
                mec_httpstatusmessage: message,           
                mec_requestbody: JSON.stringify(request_body),
                mec_responsebody: JSON.stringify(response_body),
                mec_requesttimestamp: new Date().toISOString(),
                mec_responsetimestamp: new Date().toISOString(),
                mec_responsestatus: response_status,
                mec_responsecode: response_code,
                mec_responsemessage: response_message,
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "OData-Version": "4.0",
                    "OData-MaxVersion": "4.0",
                },
            }
        );
        console.log(res);
    } catch (error) {
        console.error(error);
    }
}
