/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars, @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";
import { msAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        switch (body.event) {
            case "transactions":
                return await handleTransactions(body);

            case "payment_instruments":
                return await handlePaymentInstruments(body);

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
async function handleTransactions(body: any) {
    const reference = body.reference;
    const { id, payload } = body;
    const token = await GetD365Token();
    // Extract relevant data from the payload
    const transaction = {
        id: payload.id,
        createdDateTime: payload.createdDateTime,
        updatedDateTime: payload.updatedDateTime,
        source: payload.category?.source,
        method: payload.category?.method,
        amount: payload.payment?.amount,
        currency: payload.payment?.currencyCode,
        customerId: payload.payment?.instrument?.customer?.id,
        paymentInstrumentId: payload.payment?.instrument?.customer?.paymentInstrumentId,
        status: payload.result?.status,
    };

    console.log("Transactions event received:", transaction);
    // We need to fetch the GUID first.
    const getUrl = `/api/data/v9.2/mec_payments?$filter=mec_gppaymentinstrumentid eq '${transaction.paymentInstrumentId}' and mec_referencenumber eq '${reference}'`;
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

    // Extract the record ID
    const recordId = getResponse.data.value[0].mec_paymentid;

    // update the status in d365
    const res = await collectAxios.patch(
        `/api/data/v9.2/mec_payments(${recordId})`,
        {
            mec_paidon: transaction.status,
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

    return NextResponse.json({ message: "Transaction processed successfully" }, { status: 200 });
}

// Function to handle 'payment_instruments' event
async function handlePaymentInstruments(body: any) {
    const reference = body.reference;
    const { id, payload } = body;
    const token = await GetD365Token();
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
    const entityPropertyId = `${entityName}id`;
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
            mec_paidon: paymentInstrument.agreementStatus,
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
