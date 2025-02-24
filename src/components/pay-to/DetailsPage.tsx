"use client";

import { useForm } from "react-hook-form";
// import Image from "next/image";
import classNames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { TextField } from "@/components/form/TextField";
import { Accordion } from "@/components/Accordion";
import { List } from "@/components/List";

const schema = yup.object().shape({
  bsb: yup.string().required("BSB is required"),
  accountNumber: yup
    .string()
    .matches(/^\d{6}$/, "Code must be exactly 6 digits")
    .required("Account Number is required"),
  accountName: yup
    .string()
    .matches(/^\d{6}$/, "Code must be exactly 6 digits")
    .required("Code is required"),
});

export interface PayToFormData {
  bsb: string;
  accountNumber: string;
  accountName: string;
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
  onSubmit: (bsb: string, accountNumber: string, accountName: string) => void;
  isLoading?: boolean;
};

export function DetailsPage({ onSubmit, isLoading }: DetailsPageProps) {
  return (
    <div className="flex flex-col justify-center pb-2">
      <div className="flex flex-col">
        <PaymentDetails onSubmit={onSubmit} isLoading={isLoading} />
        <PayToInfo />
      </div>
    </div>
  );
}

export function PayToInfo() {
  return (
    <div className="mx-auto w-full">
      <div className="mt-5 flex flex-col gap-3">
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

function PaymentDetails({ onSubmit }: DetailsPageProps) {
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<PayToFormData>({
    resolver: yupResolver(schema),
  });

  const handleSubmit = () => {
    const formValues = getValues();
    onSubmit(formValues.bsb, formValues.accountNumber, formValues.accountName);
  };

  return (
    <div className="mx-auto mt-3 w-full">
      <div className="mb-2 space-y-2">
        <form>
          <TextField
            id="accountName"
            label="Account Name"
            register={register}
          />
          <div className="flex flex-row pt-2">
            <div className="w-4/12 mr-3">
              <div className="w-full">
                <label
                  htmlFor="bsb"
                  className="mb-2 block text-base font-semibold text-pa-normal"
                >
                  BSB
                </label>

                <input
                  type="text"
                  autoComplete="off"
                  placeholder="XXX-XXX"
                  id="bsb"
                  className={classNames(
                    "ease w-full rounded-md border border-pa-border bg-transparent px-3 py-2 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
                    !errors?.bsb && "focus:border-pa-primary"
                  )}
                  maxLength={7}
                  onChange={handleSubmit}
                />
                {/* {touched && errors.bsb ? (
                  <p className="text-pa-danger text-xs mt-1">
                    {errors?.bsb?.message}
                  </p>
                ) : null} */}
              </div>
            </div>
            <div className="w-8/12">
              <TextField
                id="accountNumber"
                label="Account Number"
                register={register}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
