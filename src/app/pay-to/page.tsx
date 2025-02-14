"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { makeid } from "@/helpers/stringGenerator";

import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DetailsPage } from "@/components/pay-to/DetailsPage";
import { ForAuthorizationPage } from "@/components/pay-to/ForAuthorizationPage";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { convertDate } from "@/helpers/convertDate";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";
import CustomerDetailsProps from "@/types/customerDetails";

enum PayToStep {
  ForSubmission = "ForSubmission",
  ForAuthorization = "ForAuthorization",
}

function PayTo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollToTop = useScrollToTop();
  const [step, setStep] = useState<PayToStep>(PayToStep.ForSubmission);
  const [paymentArrangementId, setPaymentArrangementId] = useState<string>("");
  const [paymentInstrumentId, setPaymentInstrumentId] = useState<string>("");
  const [agreementData, setAgreementData] = useState<AgreementDataProps>();
  const [paymentData, setPaymentData] = useState<PaymentDataProps>();
  const [requestType, setRequestType] = useState<number>();
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetailsProps>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingClick, setIsLoadingClick] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState<string>();
  const [contactId, setContactId] = useState<string>();

  const formatDate = (date: string) => {
    const [day, month, year] = date.split("/");

    // Rearrange into yyyy-mm-dd format
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  async function handleSubmit(bsb: string, bankAccount: string, name: string) {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);

    const data = {
      reference:
        requestType === 179050000
          ? paymentData?.mec_referencenumber
          : agreementData?.mec_referencenumber || "",
      paymentAgreement: {
        agreementDetails: {
          paymentAgreementType: "other_service",
          frequency:
            requestType === 179050000 ||
            agreementData?.mec_paymentfrequency === 278510004
              ? "adhoc"
              : frequencyCodeValue(agreementData?.mec_paymentfrequency || 0),
          establishmentType: "authorised",
          startDate:
            requestType === 179050000
              ? formatDate(
                  paymentData?.mec_duedate
                    ? convertDate(paymentData?.mec_duedate || "")
                    : "N/A"
                )
              : formatDate(
                  agreementData?.mec_firstpromisedate
                    ? convertDate(agreementData?.mec_firstpromisedate || "")
                    : "N/A"
                ),
          description: `Payment ${searchParams.get("reference")}`,
          balloonAgreementDetails: {
            lastPaymentDate:
              requestType === 179050000
                ? null
                : formatDate(
                    agreementData?.mec_lastpromisedate
                      ? convertDate(agreementData?.mec_lastpromisedate || "")
                      : "N/A"
                  ),
            amount:
              requestType === 179050000
                ? paymentData?.mec_amountpaid
                  ? Math.round(
                      parseFloat(`${paymentData?.mec_amountpaid.toFixed(2)}`) *
                        100
                    )
                  : null
                : agreementData?.mec_promiseamount
                ? Math.round(
                    parseFloat(
                      `${agreementData?.mec_promiseamount.toFixed(2)}`
                    ) * 100
                  )
                : null,
            lastAmount:
              requestType === 179050000
                ? null
                : agreementData?.mec_finalpaymentamount
                ? Math.round(
                    parseFloat(
                      `${agreementData?.mec_finalpaymentamount.toFixed(2)}`
                    ) * 100
                  )
                : null,
          },
        },
        payer: {
          name: name,
          type: "person",
          account: {
            bsb: bsb,
            number: bankAccount,
          },
        },
      },
    };

    axios({
      method: "POST",
      url: `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments`,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        "x-api-key":
          "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
        "x-idempotency-key": uuid(),
      },
      data: data,
    })
      .then((res) => {
        setPaymentInstrumentId(res.data.id);
        if (requestType === 179050000) {
          addGPPaymentId(token, res.data.id);
        } else {
          addGPPaymentInstrumentId(token, res.data.id);
        }
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments`,
          "POST",
          "200",
          "OK",
          data,
          res.data,
          "OK",
          "200",
          "OK"
        );
      })
      .catch((err) => {
        setIsLoading(false);
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments`,
          "POST",
          `${err.response.status}`,
          err.response.statusText,
          data,
          {},
          err.response.statusText,
          `${err.response.status}`,
          err.response.statusText
        );
      });
  }

  async function handleClick() {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
    axios({
      method: "GET",
      url: `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments/${paymentInstrumentId}`,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        "x-api-key":
          "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
        "x-idempotency-key": uuid(),
      },
    })
      .then((res) => {
        setIsLoadingClick(false);
        scrollToTop();
        if (res.data.paymentAgreement.agreementStatus === "active") {
          router.push(
            `/pay-to/approved?reference=${searchParams.get("reference")}`
          );
        } else if (res.data.paymentAgreement.agreementStatus === "cancelled") {
          router.push(
            `/pay-to/unapproved?reference=${searchParams.get("reference")}`
          );
        }
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments/${paymentInstrumentId}`,
          "POST",
          "200",
          "OK",
          {},
          res.data,
          "OK",
          "200",
          "OK"
        );
      })
      .catch((err) => {
        setIsLoadingClick(false);
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${customerDetails?.mec_gpcustomeruniqueid}/PaymentInstruments/${paymentInstrumentId}`,
          "POST",
          `${err.response.status}`,
          err.response.statusText,
          {},
          {},
          err.response.statusText,
          `${err.response.status}`,
          err.response.statusText
        );
      });
  }

  async function addGPPaymentId(token: string | null, gpInstrumentId: string) {
    try {
      const res = await axios.post("/api/add-payment-id", {
        token,
        paymentArrangementId,
        gpInstrumentId: gpInstrumentId,
      });
      if (res.data === "") {
        setIsLoading(false);
        setStep(PayToStep.ForAuthorization);
        scrollToTop();
      }
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_payments(${paymentArrangementId})`,
        "PATCH",
        "200",
        "OK",
        { mec_gppaymentinstrumentid: gpInstrumentId },
        res.data,
        "OK",
        "200",
        "OK"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_payments(${paymentArrangementId})`,
        "PATCH",
        `${error.status}`,
        error.message,
        { mec_gppaymentinstrumentid: gpInstrumentId },
        {},
        error.message,
        `${error.status}`,
        error.message
      );
    }
  }

  async function addGPPaymentInstrumentId(
    token: string | null,
    gpInstrumentId: string
  ) {
    try {
      const res = await axios.post("/api/add-payment-instrument-id", {
        token,
        paymentArrangementId,
        gpInstrumentId: gpInstrumentId,
      });
      if (res.data === "") {
        setIsLoading(false);
        setStep(PayToStep.ForAuthorization);
        scrollToTop();
      }
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_promisetopaies(${paymentArrangementId})`,
        "PATCH",
        "200",
        "OK",
        { mec_gppaymentinstrumentid: gpInstrumentId },
        res.data,
        "OK",
        "200",
        "OK"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_promisetopaies(${paymentArrangementId})`,
        "PATCH",
        `${error.status}`,
        error.message,
        { mec_gppaymentinstrumentid: gpInstrumentId },
        {},
        error.message,
        `${error.status}`,
        error.message
      );
    }
  }

  async function getCustomerDetails(
    token: string | null,
    contactIdValue: string,
    customerId: string
  ) {
    try {
      const res = await axios.post("/api/customer-details", {
        token,
        contactIdValue,
      });
      setCustomerDetails(res.data?.value[0]);
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/contacts?$filter=contactid eq ${contactIdValue}&$select=emailaddress1,fullname,mec_customerreferenceid,mec_gpcustomeruniqueid`,
        "GET",
        "200",
        "OK",
        {},
        res.data,
        "OK",
        "200",
        "OK"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/contacts?$filter=contactid eq ${contactIdValue}&$select=emailaddress1,fullname,mec_customerreferenceid,mec_gpcustomeruniqueid`,
        "GET",
        `${error.status}`,
        error.message,
        {},
        {},
        error.message,
        `${error.status}`,
        error.message
      );
    }
  }

  async function getAgreementDetails(token: string | null) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });

      setPaymentArrangementId(
        res.data?.value[0]?.mec_requesttype === 179050000
          ? res.data?.value[0]?._mec_payment_value
          : res.data?.value[0]?._mec_paymentarrangement_value
      );
      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
      setPaymentData(res.data?.value[0]?.mec_Payment);
      setRequestType(res.data?.value[0]?.mec_requesttype);
      setCustomerId(res.data?.value[0]?.mec_customerrequestid);
      if (res.data?.value[0]?.mec_RequestedBy?._mec_contact_value) {
        setContactId(res.data?.value[0]?.mec_RequestedBy?._mec_contact_value);
      }

      apiLogging(
        token || "",
        res.data?.value[0]?.mec_customerrequestid,
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_customerrequests?$filter=mec_name eq '${searchParams?.get(
          "reference"
        )}'&$expand=mec_PaymentArrangement($select=mec_paymentfrequency,mec_promiseamount,mec_numberofpayments,mec_firstpromisedate,mec_lastpromisedate,mec_finalpaymentamount,mec_totalamount,mec_referencenumber,mec_gppaymentinstrumentid), mec_RequestedBy ($select=_mec_contact_value), mec_Payment($select=mec_duedate, mec_referencenumber, mec_amountpaid, mec_gppaymentinstrumentid)`,
        "GET",
        "200",
        "OK",
        {},
        res.data,
        "OK",
        "200",
        "OK"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/mec_customerrequests?$filter=mec_name eq '${searchParams?.get(
          "reference"
        )}'&$expand=mec_PaymentArrangement($select=mec_paymentfrequency,mec_promiseamount,mec_numberofpayments,mec_firstpromisedate,mec_lastpromisedate,mec_finalpaymentamount,mec_totalamount,mec_referencenumber,mec_gppaymentinstrumentid), mec_RequestedBy ($select=_mec_contact_value), mec_Payment($select=mec_duedate, mec_referencenumber, mec_amountpaid, mec_gppaymentinstrumentid)`,
        "GET",
        `${error.status}`,
        error.message,
        {},
        {},
        error.message,
        `${error.status}`,
        error.message
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
      const res = await axios.post("/api/logging", {
        token,
        logid: makeid(6),
        mec_customerrequestid,
        apiurl,
        method,
        status_code,
        message,
        request_body,
        response_body,
        response_status,
        response_code,
        response_message,
      });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (contactId && customerId) {
      getCustomerDetails(token, contactId, customerId || "");
    }
  }, [contactId, customerId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    getAgreementDetails(token);
  }, []);

  switch (step) {
    case PayToStep.ForSubmission:
      return (
        <>
          {agreementData || paymentData ? (
            <DetailsPage
              onSubmit={handleSubmit}
              isLoading={isLoading}
              agreementData={agreementData}
              paymentData={paymentData}
              requestType={requestType}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="5em"
              height="5em"
              viewBox="0 0 24 24"
              className="mx-auto my-20"
            >
              <path
                fill="none"
                stroke="#054365"
                strokeDasharray="16"
                strokeDashoffset="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3c4.97 0 9 4.03 9 9"
              >
                <animate
                  fill="freeze"
                  attributeName="stroke-dashoffset"
                  dur="0.2s"
                  values="16;0"
                />
                <animateTransform
                  attributeName="transform"
                  dur="1.5s"
                  repeatCount="indefinite"
                  type="rotate"
                  values="0 12 12;360 12 12"
                />
              </path>
            </svg>
          )}
        </>
      );
    case PayToStep.ForAuthorization:
      return (
        <ForAuthorizationPage
          onClick={handleClick}
          isLoading={isLoadingClick}
          agreementData={agreementData}
          paymentData={paymentData}
          requestType={requestType}
        />
      );
    default:
      return null;
  }
}
export default function PaytoPage() {
  return (
    <Suspense>
      <PayTo />
    </Suspense>
  );
}
