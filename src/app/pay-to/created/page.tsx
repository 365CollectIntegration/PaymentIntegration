"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { makeid } from "@/helpers/stringGenerator";

import { useScrollToTop } from "@/hooks/useScrollToTop";
import { ForAuthorizationPage } from "@/components/pay-to/ForAuthorizationPage";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";
import CustomerDetailsProps from "@/types/customerDetails";

function PayToCreated() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollToTop = useScrollToTop();

  const [agreementData, setAgreementData] = useState<AgreementDataProps>();
  const [paymentData, setPaymentData] = useState<PaymentDataProps>();
  const [requestType, setRequestType] = useState<number>();
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetailsProps>();
  const [isLoadingClick, setIsLoadingClick] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState<string>();
  const [contactId, setContactId] = useState<string>();

  async function handleClick() {
    const token = localStorage.getItem("accessToken");
    const paymentInstrumentId = localStorage.getItem("paymentInstrumentId");
    setIsLoadingClick(true);
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

  async function getCustomerDetails(
    token: string | null,
    contactIdValue: string
  ) {
    try {
      const res = await axios.post("/api/customer-details", {
        token,
        contactIdValue,
      });
      setCustomerDetails(res.data?.value[0]);
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      console.error(error);
    }
  }

  async function getAgreementDetails(token: string | null) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });

      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
      setPaymentData(res.data?.value[0]?.mec_Payment);
      setRequestType(res.data?.value[0]?.mec_requesttype);
      setCustomerId(res.data?.value[0]?.mec_customerrequestid);
      if (res.data?.value[0]?.mec_RequestedBy?._mec_contact_value) {
        setContactId(res.data?.value[0]?.mec_RequestedBy?._mec_contact_value);
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      console.error(error);
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
      getCustomerDetails(token, contactId);
    }
  }, [contactId, customerId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    getAgreementDetails(token);
  }, []);

  return (
    <>
      {agreementData || paymentData ? (
        <ForAuthorizationPage
          onClick={handleClick}
          isLoading={isLoadingClick}
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
}

export default function PayToCreatedPage() {
  return (
    <Suspense>
      <PayToCreated />
    </Suspense>
  );
}
