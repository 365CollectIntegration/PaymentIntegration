"use client";

import axios from "axios";
import { useExternalScript } from "@/hooks/useExternalScript";

import { Accordion } from "@/components/Accordion";
import { List } from "@/components/List";

import { FormTitle } from "@/components/Field";
import { Button } from "@/components/Button";

export interface PayToFormData {
  cardNumber: string;
  name?: string;
  expiryDate?: string;
  cvv?: string;
}

const PAY_TO_TEXT = [
  "It seems that the PayTo agreement was not authorised. This means the transaction setup could not be completed.",
];

const SIGN_UP_TEXT = [
  "We've pre-populated your bank account details onto a direct debit agreement, please  check the details and if you are happy, click  the button to get this one setup.",
  "If you'd prefer to use a credit card to make these payments, simply fill up the form and click 'Pay'.",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const GPAUNZ: any;

function UnapprovedPage() {
  useExternalScript({
    url: "https://rapid-api-hosted.prod.ewaylabs.cloud/static/securepanel/js/securepanel.min.js",
    onLoad: async () => {
      const token = await getOneTimeToken();
      processInitialization(token);
    },
  });

  return (
    <div className="flex flex-col justify-center px-8 pb-8 pt-4">
      <div className="flex flex-col">
        <PayToInfo />
        <PaymentDetails />
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
            viewBox="0 0 16 16"
          >
            <path
              fill="#d40037"
              fillRule="evenodd"
              d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M6.53 5.47a.75.75 0 0 0-1.06 1.06L6.94 8L5.47 9.47a.75.75 0 1 0 1.06 1.06L8 9.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L9.06 8l1.47-1.47a.75.75 0 1 0-1.06-1.06L8 6.94z"
              clipRule="evenodd"
            />
          </svg>
          <div className="my-auto ml-2 text-pa-danger-text">
            AUTHORISATION FAILED
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

function PaymentDetails() {
  return (
    <div className="mx-auto mt-3 w-full md:w-5/12">
      <div className="rounded-xl border border-gray-100 p-4 shadow-md md:p-8">
        <FormTitle text=" Credit Card Payment" />
        <div id="secure-panel"></div>
        <Button label="Pay" containerClassName="mt-8 w-full md:w-1/2 mx-auto" />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function onInitialization(response: any) {
  console.log("on credit card initialization response", response);
}

function processInitialization(token: string) {
  const config = {
    oneTimeToken: token,
    fieldDivId: "secure-panel",
    layout: {
      rows: [
        {
          cells: [
            {
              colspan: 6,
              label: { text: "Card Name:", fieldColspan: 5 },
              field: { fieldType: "name", fieldColspan: 7 },
            },
            {
              colspan: 6,
              label: { text: "Card Number:", fieldColspan: 5 },
              field: { fieldType: "number", fieldColspan: 7 },
            },
          ],
        },
        {
          cells: [
            {
              colspan: 6,
              label: { text: "Expiry:", fieldColspan: 5 },
              field: { fieldType: "expiry", fieldColspan: 7 },
            },
            {
              colspan: 6,
              label: { text: "CVV Number:", fieldColspan: 5 },
              field: { fieldType: "cvn", fieldColspan: 7 },
            },
          ],
        },
      ],
    },
  };

  GPAUNZ.SecurePanel.initialise(config, null, onInitialization);
}

async function getOneTimeToken() {
  try {
    const res = await axios("/api/secure-panel-token");
    return res.data?.token ?? "";
  } catch (error) {
    console.error(error);
  }
}

export default UnapprovedPage;
