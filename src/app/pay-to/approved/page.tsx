"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { Accordion } from "@/components/Accordion";
import { List } from "@/components/List";
import { Field, FieldsContainer, FormTitle } from "@/components/Field";
import { STORE_NAME } from "@/helpers/common";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { convertDate } from "@/helpers/convertDate";
import { AgreementDataProps } from "@/types/agreements";

type AgreementDetailsProps = {
  agreementData?: AgreementDataProps;
};

const PAY_TO_TEXT = [
  "Thanks for authorising your PayTo agreement, that's all that's  needed from your side",
];

const SIGN_UP_TEXT = [
  `We look forward to welcoming you in your local branch of ${STORE_NAME}`,
];

function ApprovedPage() {
  const [agreementData, setAgreementData] = useState<AgreementDataProps>();

  async function getAgreementDetails(
    token: string | null,
    reference: string | null
  ) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference,
      });
      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const reference = localStorage.getItem("reference");
    getAgreementDetails(token, reference);
  }, []);

  return (
    <div className="flex flex-col justify-center px-8 pb-8 pt-4">
      <div className="flex flex-col">
        <PayToInfo />
        {agreementData ? (
          <AgreementDetails agreementData={agreementData} />
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
      </div>
    </div>
  );
}

function PayToInfo() {
  return (
    <div className="mx-auto w-full md:w-5/12">
      <div className="my-3 flex flex-col gap-3">
        <div className="mx-auto flex flex-row text-2xl font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2em"
            height="2em"
            viewBox="0 0 24 24"
          >
            <path
              fill="#114d33"
              fillRule="evenodd"
              d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-.232-5.36l5-6l-1.536-1.28l-4.3 5.159l-2.225-2.226l-1.414 1.414l3 3l.774.774z"
              clipRule="evenodd"
            />
          </svg>
          <div className="my-auto ml-2 text-pa-success-text">
            AUTHORISATION COMPLETE
          </div>
        </div>
        <Accordion title="What has happened?">
          <List items={PAY_TO_TEXT} />
        </Accordion>

        <Accordion title="What do I do now?">
          <List items={SIGN_UP_TEXT} />
        </Accordion>
      </div>
    </div>
  );
}

function AgreementDetails({ agreementData }: AgreementDetailsProps) {
  return (
    <div className="mx-auto mt-3 w-full md:w-5/12">
      <div className="my-5 rounded-xl border border-gray-100 p-4 shadow-md md:p-8">
        <FormTitle text="Agreement Details" />
        <FieldsContainer>
          <Field label="Agreement Status" value="Authorised" />
          <Field
            label="Payee"
            value="Global Payments on behalf of 365 Collect"
          />
          <Field
            label="Frequency"
            value={frequencyCodeValue(agreementData?.mec_paymentfrequency || 0)}
          />
          <Field
            label="Start Date"
            value={convertDate(agreementData?.mec_firstpromisedate || "")}
          />
          <Field
            label="End Date"
            value={convertDate(agreementData?.mec_lastpromisedate || "")}
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
      </div>
    </div>
  );
}

export default ApprovedPage;
