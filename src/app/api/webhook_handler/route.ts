import { v4 as uuid } from "uuid";
import { NextResponse, NextRequest } from "next/server";
import { collectAxios } from "@/utils/apiUtils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    switch (body.event) {
        case "transactions":
          return await handleTransactions(body);
  
        case "payment_instruments":
          return handlePaymentInstruments(body);
  
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

    const getUrl = `/api/data/v9.2/mec_payments?$filter=mec_gppaymentinstrumentid eq '${transaction.paymentInstrumentId}' and mec_referencenumber eq '${reference}'`;
    const getResponse = await collectAxios.get(getUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${body.token}`,
        "OData-Version": "4.0",
        "OData-MaxVersion": "4.0",
      },
    });

    if (getResponse.data.value.length === 0) {
      console.log("No record found for the provided paymentInstrumentId");
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    // Extract the record ID
    const recordId = getResponse.data.value[0].mec_paymentid;
  
    const res = await collectAxios.patch(
        `/api/data/v9.2/mec_payments(${recordId})`,
        {
            mec_paidon: transaction.status,
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

    // Perform further processing or database updates here
  
    return NextResponse.json({ message: "Transaction processed successfully" }, { status: 200 });
  }
  
  // Function to handle 'payment_instruments' event
  function handlePaymentInstruments(body: any) {
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
      payerName: payload.paymentAgreement?.payer?.name,
      payerType: payload.paymentAgreement?.payer?.type,
      payerAccount: payload.paymentAgreement?.payer?.account,
      payeeMerchantName: payload.paymentAgreement?.payee?.merchantName,
      resultStatus: payload.result?.status,
      resultMode: payload.result?.mode,
    };
  
    

    console.log("Payment instrument event received:", paymentInstrument);
  
    // Perform further processing or database updates here
  
    return NextResponse.json({ message: "Payment instrument processed successfully" }, { status: 200 });
  }
  
