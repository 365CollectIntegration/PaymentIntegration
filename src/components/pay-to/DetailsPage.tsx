"use client";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { TextField } from "@/components/form/TextField";
import { Accordion } from "@/components/Accordion";
import { List } from "@/components/List";
import { Button } from "@/components/Button";
import { Field, FieldsContainer, FormTitle } from "@/components/Field";
import { STORE_NAME } from "@/helpers/common";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";
import { convertDate } from "@/helpers/convertDate";

export interface PayToFormData {
  bsb: string;
  bankAccount: string;
  name: string;
}

const PAY_TO_TEXT = [
  "PayTo is an Australian wide, bank-secured platform for making payments.",
  "PayTo lets you see and manage all of your recurring payment agreements in your internet or mobile banking app.",
];

const SIGN_UP_TEXT = [
  "You don't need to set anything up. PayTo is active on select bank accounts and is progressively being rolled out by Australian banks.",
  "If your account is not yet setup for PayTo, you will be provided with an option to use a direct debit agreement instead.",
];

type DetailsPageProps = {
  onSubmit: (bsb: string, bankAccount: string, name: string) => void;
  isLoading?: boolean;
  agreementData?: AgreementDataProps;
  paymentData?: PaymentDataProps;
  requestType?: number;
};

export function DetailsPage({
  onSubmit,
  isLoading,
  agreementData,
  paymentData,
  requestType,
}: DetailsPageProps) {
  return (
    <div className="flex flex-col justify-center px-8 pb-8 pt-4">
      <div className="flex flex-col">
        <PayToInfo />
        <PaymentDetails
          onSubmit={onSubmit}
          isLoading={isLoading}
          agreementData={agreementData}
          paymentData={paymentData}
          requestType={requestType}
        />
      </div>
    </div>
  );
}

function PayToInfo() {
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
        <Accordion title="What is a PayTo?">
          <List items={PAY_TO_TEXT} />
        </Accordion>

        <Accordion title="Do I need to sign up?">
          <List items={SIGN_UP_TEXT} />
        </Accordion>
      </div>
    </div>
  );
}

function PaymentDetails({
  onSubmit,
  isLoading,
  agreementData,
  paymentData,
  requestType,
}: DetailsPageProps) {
  const { register, getValues } = useForm<PayToFormData>();

  const handleSubmit = () => {
    const formValues = getValues();
    onSubmit(formValues.bsb, formValues.bankAccount, formValues.name);
  };

  return (
    <div className="mx-auto mt-3 w-full md:w-5/12">
      <div className="rounded-xl border border-gray-100 p-4 shadow-md md:p-8">
        <FormTitle text=" Payment Details" />
        <div className="mb-2 space-y-2">
          <TextField id="bsb" label="BSB" register={register} />
          <TextField
            id="bankAccount"
            label="BANK ACCOUNT"
            register={register}
          />
          <TextField id="name" label="NAME" register={register} />
        </div>
        {requestType === 179050000 ? (
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
              value={convertDate(paymentData?.mec_duedate || "")}
              withoutBorder
            />
          </FieldsContainer>
        ) : (
          <FieldsContainer>
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
            />
            <Field
              label="Start Date"
              value={convertDate(agreementData?.mec_firstpromisedate || "")}
              withoutBorder
            />
          </FieldsContainer>
        )}
      </div>
      <div className="mt-5 rounded-xl border border-pa-background-box bg-pa-background-box p-4 shadow-md md:p-8">
        <div className="text-sm">
          {`By clicking "Setup Agreement" I confirm I have read and accept the
          terms and conditions associated with submitting this application
          online. By submitting this form for processing I request and authorise
          Global Payments, T/A Ezidebit on behalf of ${STORE_NAME}, to debit
          my/our nominated bank account through an established PayTo agreement.
          If available, the PayTo agreement is not finalised until the agreement
          is authorised inside my internet banking. I/We must pay you when the
          bill is due under the arrangement between us.`}
        </div>
        <Button
          label="Setup Agreement"
          containerClassName="mt-4 w-full md:w-1/2 mx-auto"
          onClick={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// function getFieldType(title: string) {
//   if (["Amount:", "Last Amount:"].includes(title)) {
//     return FIELD_TYPE.AMOUNT;
//   }

//   return undefined;
// }
