"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DetailsPage } from "@/components/pay-to/DetailsPage";
import { ForAuthorizationPage } from "@/components/pay-to/ForAuthorizationPage";
// import { makeid } from "@/helpers/stringGenerator";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { convertDate } from "@/helpers/convertDate";
import { AgreementDataProps } from "@/types/agreements";
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
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetailsProps>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingClick, setIsLoadingClick] = useState<boolean>(false);

  const formatDate = (date: string) => {
    const [day, month, year] = date.split("/");

    // Rearrange into yyyy-mm-dd format
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  async function handleSubmit(bsb: string, bankAccount: string, name: string) {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);
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
      data: {
        reference: agreementData?.mec_referencenumber || "",
        paymentAgreement: {
          agreementDetails: {
            paymentAgreementType: "other_service",
            frequency: frequencyCodeValue(
              agreementData?.mec_paymentfrequency || 0
            ),
            establishmentType: "authorised",
            startDate: formatDate(
              agreementData?.mec_firstpromisedate
                ? convertDate(agreementData?.mec_firstpromisedate || "")
                : "N/A"
            ),
            description: "Payment Arrangement",
            balloonAgreementDetails: {
              lastPaymentDate: formatDate(
                agreementData?.mec_lastpromisedate
                  ? convertDate(agreementData?.mec_lastpromisedate || "")
                  : "N/A"
              ),
              amount: agreementData?.mec_promiseamount
                ? parseInt(`${agreementData?.mec_promiseamount.toFixed(2)}`) *
                  100
                : null,
              lastAmount: agreementData?.mec_finalpaymentamount
                ? parseInt(
                    `${agreementData?.mec_finalpaymentamount.toFixed(2)}`
                  ) * 100
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
      },
    })
      .then((res) => {
        setPaymentInstrumentId(res.data.id);
        addGPPaymentInstrumentId(token, res.data.id);
        createWebhook();
      })
      .catch(() => {
        setIsLoading(false);
      });
  }

  async function handleClick() {
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
      })
      .catch(() => {
        setIsLoadingClick(false);
      });
  }

  const createWebhook = () => {
    axios({
      method: "POST",
      url: `https://mock.globalrapid.io/webhooks`,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        "x-api-key": "eyJ1c2VyIjogMTIzNCwgImFwaUtleSI6ICJ0ZXN0MTIzNCJ9",
      },
      data: {
        event: "payment_instruments",
        url: "https://365paymentgateway.azurewebsites.net/pay-to",
      },
    })
      .then((res) => {
        retrieveWebhook(res.data.id);
      })
      .catch();
  };

  const retrieveWebhook = (id: string) => {
    axios({
      method: "GET",
      url: `https://mock.globalrapid.io/webhooks/${id}`,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        "x-api-key": "eyJ1c2VyIjogMTIzNCwgImFwaUtleSI6ICJ0ZXN0MTIzNCJ9",
      },
    })
      .then((res) => {
        console.log("ZXC: ", res.data);
      })
      .catch();
  };

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
    } catch (error) {
      console.error(error);
    }
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
    } catch (error) {
      console.error(error);
    }
  }

  async function getAgreementDetails(token: string | null) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });
      setPaymentArrangementId(
        res.data?.value[0]?._mec_paymentarrangement_value
      );
      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
      if (res.data?.value[0]?.mec_RequestedBy?._mec_contact_value) {
        getCustomerDetails(
          token,
          res.data?.value[0]?.mec_RequestedBy?._mec_contact_value
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    getAgreementDetails(token);
  }, []);

  switch (step) {
    case PayToStep.ForSubmission:
      return (
        <>
          {agreementData ? (
            <DetailsPage
              onSubmit={handleSubmit}
              isLoading={isLoading}
              agreementData={agreementData}
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
