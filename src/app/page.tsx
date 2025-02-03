"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/Button";
import { Field, FieldsContainer, FormTitle } from "@/components/Field";
import { convertDate } from "@/helpers/convertDate";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";
import CustomerDetailsProps from "@/types/customerDetails";

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [agreementData, setAgreementData] = useState<AgreementDataProps>();
  const [paymentData, setPaymentData] = useState<PaymentDataProps>();
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetailsProps>();
  const [contactId, setContactId] = useState<string>();
  const [requestType, setRequestType] = useState<number>();

  async function handleClick() {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoading(true);
    if (customerDetails?.mec_gpcustomeruniqueid) {
      router.push(`/pay-to?reference=${searchParams.get("reference")}`);
    } else {
      axios({
        method: "POST",
        url: `https://sandbox.api.gpaunz.com/customers`,
        headers: {
          Accept: "application/json, text/plain",
          "Content-Type": "application/json",
          "x-api-key":
            "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
          "x-idempotency-key": uuid(),
        },
        data: {
          name: customerDetails?.fullname,
          email: customerDetails?.emailaddress1,
          reference: customerDetails?.mec_customerreferenceid,
        },
      })
        .then((res) => {
          addGPCustomerUniqueId(accessToken, res.data.id);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }

  async function addGPCustomerUniqueId(
    token: string | null,
    gpUniqueId: string
  ) {
    try {
      const res = await axios.post("/api/add-customer-id", {
        token,
        contactId,
        gpUniqueId: gpUniqueId,
      });
      if (res.data === "") {
        setIsLoading(false);
        router.push(`/pay-to?reference=${searchParams.get("reference")}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getCustomerDetails(token: string, contactIdValue: string) {
    try {
      const res = await axios.post("/api/customer-details", {
        token,
        contactIdValue,
      });
      setCustomerDetails(res.data?.value[0]);
    } catch (error) {
      console.error(error);
    }
  }

  async function getAgreementDetails(token: string) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });
      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
      setPaymentData(res.data?.value[0]?.mec_Payment);
      setRequestType(res.data?.value[0]?.mec_requesttype);
      if (res.data?.value[0]?.mec_RequestedBy?._mec_contact_value) {
        getCustomerDetails(
          token,
          res.data?.value[0]?.mec_RequestedBy?._mec_contact_value
        );
        setContactId(res.data?.value[0]?.mec_RequestedBy?._mec_contact_value);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getToken() {
    try {
      const res = await axios("/api/token");
      getAgreementDetails(res.data.token.access_token);
      localStorage.setItem("accessToken", res.data.token.access_token);
      localStorage.setItem("reference", searchParams.get("reference") || "");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getToken();
  }, []);

  return (
    <div className="flex flex-col px-8 pb-8 pt-4">
      <div className="mx-auto my-5 w-full rounded-xl border border-gray-100 p-4 shadow-md md:w-5/12">
        {agreementData || paymentData ? (
          <>
            <FormTitle
              text={
                requestType === 179050000 ? "Your Payment" : "Your Payment Plan"
              }
            />
            {requestType === 179050000 ? (
              <div className="flex h-64">
                <div className="m-auto text-lg">
                  <div className="flex flex-row mb-3">
                    <div className="font-bold">Total Amount: </div>
                    <div className="ml-2 font-medium">
                      {paymentData?.mec_amountpaid || "N/A"}
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="font-bold">Payment Date: </div>
                    <div className="ml-2 font-medium">
                      {paymentData?.mec_duedate || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <FieldsContainer>
                <Field
                  label="Total Amount"
                  value={
                    agreementData?.mec_totalamount
                      ? `$${agreementData?.mec_totalamount?.toFixed(2)}`
                      : "N/A"
                  }
                />
                <Field
                  label="Frequency"
                  value={frequencyCodeValue(
                    agreementData?.mec_paymentfrequency || 0
                  )}
                />
                <Field
                  label="Number of payments"
                  value={agreementData?.mec_numberofpayments}
                />
                <Field
                  label="Start Date"
                  value={
                    agreementData?.mec_firstpromisedate
                      ? convertDate(agreementData?.mec_firstpromisedate || "")
                      : "N/A"
                  }
                />
                <Field
                  label="End Date"
                  value={
                    agreementData?.mec_lastpromisedate
                      ? convertDate(agreementData?.mec_lastpromisedate || "")
                      : "N/A"
                  }
                />
                <Field
                  label="Ongoing Payments"
                  value={
                    agreementData?.mec_promiseamount
                      ? `$${agreementData?.mec_promiseamount?.toFixed(2)}`
                      : "N/A"
                  }
                />
                <Field
                  label="Last Payment"
                  value={
                    agreementData?.mec_finalpaymentamount
                      ? `$${agreementData?.mec_finalpaymentamount?.toFixed(2)}`
                      : "N/A"
                  }
                  withoutBorder
                />
              </FieldsContainer>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className="md:5/12 mx-auto w-full rounded-xl border border-gray-100 bg-pa-background-box p-4 shadow-md md:w-5/12">
        <FormTitle text="Select your payment method" />

        <div className="px-8">
          <Button
            label="Bank Account"
            containerClassName="mt-4 w-full md:w-1/2 mx-auto"
            variant="button-dark"
            isLoading={isLoading}
            onClick={handleClick}
          />
          <Button
            label="Credit Card"
            containerClassName="mt-2 w-full md:w-1/2 mx-auto"
            variant="button-light"
            onClick={() => {
              router.push("/credit-card");
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
