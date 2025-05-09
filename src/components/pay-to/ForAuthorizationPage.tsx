"use client";
import Image from "next/image";

import { Accordion } from "@/components/Accordion";
import { Alert } from "@/components/Alert";
import { Field, FieldsContainer, FormTitle } from "@/components/Field";
import { CustomList, List, ListItem } from "@/components/List";
import { Button } from "@/components/Button";
import { STORE_NAME } from "@/helpers/common";
import { COLOR_VARIANT } from "@/helpers/componentHelpers";
import { convertDate } from "@/helpers/convertDate";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";

import styles from "./ForAuthorizationPage.module.scss";

const TO_DO_TEXT = [
  "You should receive a notification from your bank that a PayTo agreement is waiting for authorisation.",
  "Login securely to your internet banking portal or app to authorise the agreement.",
  "You have 5 days before this agreement expires.",
];

const WHY_AUTHORISE_TEXT = [
  "Your new payment plan will not be activated until the agreement is authorised.",
  "PayTo agreements give you visibility and control over all your recurring payments.",
];

type ForAuthorizationPageProps = {
  onClick: () => void;
  isLoading?: boolean;
  agreementData?: AgreementDataProps;
  paymentData?: PaymentDataProps;
  requestType?: number;
};

export function ForAuthorizationPage({
  onClick,
  isLoading,
  agreementData,
  paymentData,
  requestType,
}: ForAuthorizationPageProps) {
  return (
    <div className="flex flex-col p-8">
      <Info />
      <AgreementDetails
        onClick={onClick}
        isLoading={isLoading}
        agreementData={agreementData}
        paymentData={paymentData}
        requestType={requestType}
      />
    </div>
  );
}

function Info() {
  return (
    <div className="mx-auto w-full md:w-5/12">
      <Image
        className="mx-auto w-16"
        src="/images/pay-to-logo.png"
        alt="pay-to logo"
        width={220}
        height={109}
      />
      <div className="my-3 flex flex-col gap-3">
        <Accordion title="What has happened?">
          <List
            items={[
              `We've created a PayTo agreement that will appear in your internet
            banking as your account is already enabled for PayTo.`,
            ]}
            className={styles.toDoList}
          />
        </Accordion>
        <Accordion title="What do I do now?">
          <List items={TO_DO_TEXT} className={styles.toDoList} />
        </Accordion>

        <Accordion title="Why should I authorise?">
          <List
            items={WHY_AUTHORISE_TEXT}
            className={styles.whyAuthoriseList}
          />
        </Accordion>
      </div>
    </div>
  );
}

function AgreementDetails({
  onClick,
  isLoading,
  agreementData,
  paymentData,
  requestType,
}: ForAuthorizationPageProps) {
  return (
    <div className="mx-auto mt-3 w-full md:w-5/12">
      <Alert
        variant={COLOR_VARIANT.INFO}
        title="IMPORTANT – OPEN YOUR BANKING APP TO AUTHORISE YOUR AGREEMENT"
      >
        <CustomList className="pl-3 pt-2 font-normal text-pa-info-text">
          <ListItem>
            You should receive a notification from your bank that a PayTo
            agreement is waiting for authorisation.
          </ListItem>
          <ListItem>
            Login securely to your internet banking portal or app and navigate
            your Pay To agreements.
          </ListItem>
          <ListItem>
            {`Review and authorise the pending agreement labelled "Global Payments
            on behalf of 365 Collect".`}
          </ListItem>
        </CustomList>
      </Alert>

      <div className="my-8 rounded-xl border border-gray-100 p-4 shadow-md md:p-8">
        <FormTitle text="Agreement Details" />
        {requestType === 179050000 ? (
          <div className="pb-5">
            <FieldsContainer>
              <Field
                label="Total Amount"
                value={
                  paymentData?.mec_amountpaid
                    ? `$${paymentData?.mec_amountpaid?.toFixed(2)}`
                    : "N/A"
                }
              />
              <Field
                label="Payment Date"
                value={
                  paymentData?.mec_duedate
                    ? convertDate(paymentData?.mec_duedate || "")
                    : "N/A"
                }
              />
            </FieldsContainer>
          </div>
        ) : (
          <FieldsContainer>
            <Field
              label="Payee"
              value={`Global Payments on behalf of ${STORE_NAME}`}
            />
            <Field
              label="Frequency"
              value={frequencyCodeValue(
                agreementData?.mec_paymentfrequency || 0
              )}
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
        )}
      </div>
      <Button
        label="Simulate Banking App"
        containerClassName="mt-4 w-full md:w-1/2 mx-auto"
        onClick={onClick}
        isLoading={isLoading}
      />
    </div>
  );
}
