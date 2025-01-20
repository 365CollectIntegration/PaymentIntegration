"use client";

import { useState, useEffect, Suspense } from "react";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DetailsPage } from "@/components/pay-to/DetailsPage";
import { ForAuthorizationPage } from "@/components/pay-to/ForAuthorizationPage";
// import { gpAxios } from "@/utils/apiUtils";
import { makeid } from "@/helpers/stringGenerator";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { convertDate } from "@/helpers/convertDate";
import { AgreementDataProps } from "@/types/agreements";
// import CustomerDetailsProps from "@/types/customerDetails";

enum PayToStep {
  ForSubmission = "ForSubmission",
  ForAuthorization = "ForAuthorization",
}

function PayTo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollToTop = useScrollToTop();
  const [step, setStep] = useState<PayToStep>(PayToStep.ForSubmission);
  const [paymentInstrumentId, setPaymentInstrumentId] = useState<string>("");
  const [agreementData, setAgreementData] = useState<AgreementDataProps>();
  // const [customerDetails, setCustomerDetails] =
  //   useState<CustomerDetailsProps>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingClick, setIsLoadingClick] = useState<boolean>(false);

  const formatDate = (date: string) => {
    const [day, month, year] = date.split("/");

    // Rearrange into yyyy-mm-dd format
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  async function handleSubmit(bsb: string, bankAccount: string, name: string) {
    const customerId = localStorage.getItem("customerId");
    setIsLoading(true);
    // try {
    //   const res = await gpAxios.post(
    //     `/customers/${customerId}/PaymentInstruments`,
    //     {
    //       reference: makeid(6),
    //       paymentAgreement: {
    //         agreementDetails: {
    //           paymentAgreementType: "mortgage",
    //           frequency: "weekly",
    //           establishmentType: "authorised",
    //           startDate: "2025-01-30",
    //           description: "mortgage payments",
    //           balloonAgreementDetails: {
    //             lastPaymentDate: "2026-12-30",
    //             amount: +amount,
    //             lastAmount: 10010,
    //           },
    //         },
    //         payer: {
    //           name: "Sample Customer",
    //           type: "person",
    //           account: {
    //             bsb: "012306",
    //             number: "12345678",
    //           },
    //         },
    //       },
    //     },
    //     {
    //       headers: {
    //         Accept: "application/json, text/plain",
    //         "Content-Type": "application/json",
    //         "x-api-key":
    //           "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
    //         "x-idempotency-key": uuid(),
    //       },
    //     }
    //   );
    //   setPaymentInstrumentId(res.data.id);
    //   setIsLoading(false);
    //   setStep(PayToStep.ForAuthorization);
    //   scrollToTop();
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setIsLoading(false);
    // }
    axios({
      method: "POST",
      url: `https://sandbox.api.gpaunz.com/customers/${customerId}/PaymentInstruments`,
      headers: {
        Accept: "application/json, text/plain",
        "Content-Type": "application/json",
        "x-api-key":
          "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
        "x-idempotency-key": uuid(),
      },
      data: {
        reference: makeid(6),
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
              amount: +bankAccount,
              lastAmount: agreementData?.mec_finalpaymentamount
                ? parseInt(`${agreementData?.mec_finalpaymentamount}`)
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
        setIsLoading(false);
        setStep(PayToStep.ForAuthorization);
        scrollToTop();
      })
      .catch(() => {
        setIsLoading(false);
      });
  }

  async function handleClick() {
    const customerId = localStorage.getItem("customerId");
    setIsLoading(true);
    // try {
    //   const res = await gpAxios.get(
    //     `/customers/${customerId}/PaymentInstruments/${paymentInstrumentId}`,
    //     {
    //       headers: {
    //         Accept: "application/json, text/plain",
    //         "Content-Type": "application/json",
    //         "x-api-key":
    //           "zzOIzbv-AlAbxp8.USNoE128vssg6sH4e6uUtUll1khphUhtdtdM1zaL9Kg",
    //         "x-idempotency-key": uuid(),
    //       },
    //     }
    //   );
    //   setIsLoadingClick(false);
    //   scrollToTop();
    //   if (res.data.paymentAgreement.agreementStatus === "active") {
    //     router.push(
    //       `/pay-to/approved?reference=${searchParams.get("reference")}`
    //     );
    //   } else if (res.data.paymentAgreement.agreementStatus === "cancelled") {
    //     router.push(
    //       `/pay-to/unapproved?reference=${searchParams.get("reference")}`
    //     );
    //   }
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setIsLoadingClick(false);
    // }
    axios({
      method: "GET",
      url: `https://sandbox.api.gpaunz.com/customers/${customerId}/PaymentInstruments/${paymentInstrumentId}`,
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

  // async function getCustomerDetails(token: string, contactId: string) {
  //   try {
  //     const res = await axios.post("/api/customer-details", {
  //       token,
  //       contactId,
  //     });
  //     setCustomerDetails(res.data?.value[0]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async function getAgreementDetails(token: string | null) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });
      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
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
