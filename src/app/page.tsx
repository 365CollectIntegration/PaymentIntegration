/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { v4 as uuid } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import classNames from "classnames";

import { PayToInfo } from "@/components/pay-to/DetailsPage";
import { Button } from "@/components/Button";
import { Field, FieldsContainer, FormTitle } from "@/components/Field";
import { Loader } from "@/components/Icons";
import { convertDate } from "@/helpers/convertDate";
import { frequencyCodeValue } from "@/helpers/frequencyCodeValue";
import { AgreementDataProps, PaymentDataProps } from "@/types/agreements";
import CustomerDetailsProps from "@/types/customerDetails";
import { makeid } from "@/helpers/stringGenerator";

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [agreementData, setAgreementData] = useState<AgreementDataProps>();
  const [paymentData, setPaymentData] = useState<PaymentDataProps>();
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetailsProps>();
  const [customerId, setCustomerId] = useState<string>();
  const [contactId, setContactId] = useState<string>();
  const [paymentArrangementId, setPaymentArrangementId] = useState<string>("");
  const [requestType, setRequestType] = useState<number>();
  const [stateToken, setStateToken] = useState<string>();
  const [selected, setSelected] = useState<string>("");
  // FORM
  const [bsb, setBsb] = useState("");
  const [bsbError, setBsbError] = useState("");
  // const [maskedBsb, setMaskedBsb] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNameError, setAccountNameError] = useState("");

  const handleChangeBsb = (e: React.ChangeEvent<HTMLInputElement>) => {

    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    // Ensure input doesn't exceed 6 digits
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    // Auto-format into xxx-xxx
    if (value.length >= 3) {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}`;
    }

    setBsb(value);    
  };

  const handleAccountNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*$/.test(e.target.value)) {
      const inputValue = e.target.value;
      if (inputValue.length < 1) {
        setAccountNumberError("Account number is required.");
      } else {
        if (inputValue.length < 6) {
          setAccountNumberError(
            "Invalid account number. Please enter a number between 6 and 10 digits"
          );
        } else {
          setAccountNumberError("");
        }
      }
      setAccountNumber(inputValue);
    }
  };

  const handleAccountName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^[A-Za-z0-9' -]*$/.test(e.target.value)) {
      const inputValue = e.target.value;
      if (inputValue.length < 1) {
        setAccountNameError("Account name is required.");
      } else {
        setAccountNameError("");
      }
      setAccountName(inputValue);
    }
  };

  const formatDate = (date: string) => {
    const [day, month, year] = date.split("/");

    // Rearrange into yyyy-mm-dd format
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  // CREATE CUSTOMER
  async function handleContinue() {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoading(true);
    if (customerDetails?.mec_gpcustomeruniqueid) {
      createPaymentInstrument(customerDetails?.mec_gpcustomeruniqueid);
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
          createPaymentInstrument(res.data.id);
          apiLogging(
            accessToken || "",
            customerId || "",
            `https://sandbox.api.gpaunz.com/customers`,
            "POST",
            "200",
            "OK",
            {
              name: customerDetails?.fullname,
              email: customerDetails?.emailaddress1,
              reference: customerDetails?.mec_customerreferenceid,
            },
            res.data,
            "OK",
            "200",
            "OK"
          );
        })
        .catch((err) => {
          router.push(
            `/pay-to/review?reference=${searchParams.get("reference")}`
          );
          setIsLoading(false);
          apiLogging(
            accessToken || "",
            customerId || "",
            `https://sandbox.api.gpaunz.com/customers`,
            "POST",
            `${err.response.status}`,
            err.response.statusText,
            {
              name: customerDetails?.fullname,
              email: customerDetails?.emailaddress1,
              reference: customerDetails?.mec_customerreferenceid,
            },
            {},
            err.response.statusText,
            `${err.response.status}`,
            err.response.statusText
          );
        });
    }
  }

  // CREATE PAYMENT INSTRUMENT
  async function createPaymentInstrument(gpcustomeruniqueid: string) {
    const token = localStorage.getItem("accessToken");
    setIsLoading(true);

    const data = {
      reference:
        requestType === 179050000
          ? paymentData?.mec_referencenumber
          : agreementData?.mec_referencenumber || "",
      // reference: "testzxczxczxc",
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
          // startDate: "2025-03-01",
          description: `Payment ${searchParams.get("reference")}`,
          balloonAgreementDetails: {
            // lastPaymentDate: "2025-03-30",
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
          name: accountName,
          type: "person",
          account: {
            bsb: bsb,
            number: accountNumber,
          },
        },
      },
    };

    axios({
      method: "POST",
      url: `https://sandbox.api.gpaunz.com/customers/${gpcustomeruniqueid}/PaymentInstruments`,
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
        localStorage.setItem("paymentInstrumentId", res.data.id);
        if (requestType === 179050000) {
          addGPPaymentId(token, res.data.id);
        } else {
          addGPPaymentInstrumentId(token, res.data.id);
        }
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${gpcustomeruniqueid}/PaymentInstruments`,
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
        router.push(
          `/pay-to/review?reference=${searchParams.get("reference")}`
        );
        setIsLoading(false);
        apiLogging(
          token || "",
          customerId || "",
          `https://sandbox.api.gpaunz.com/customers/${gpcustomeruniqueid}/PaymentInstruments`,
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
      apiLogging(
        token || "",
        customerId || "",
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/contacts(${contactId})`,
        "PATCH",
        "200",
        "OK",
        { gpUniqueId: gpUniqueId },
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
        `https://collect-dev.crm6.dynamics.com/api/data/v9.2/contacts(${contactId})`,
        "PATCH",
        `${error.status}`,
        error.message,
        { gpUniqueId: gpUniqueId },
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
        router.push(
          `/pay-to/created?reference=${searchParams.get("reference")}`
        );
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

  async function addGPPaymentId(token: string | null, gpInstrumentId: string) {
    try {
      const res = await axios.post("/api/add-payment-id", {
        token,
        paymentArrangementId,
        gpInstrumentId: gpInstrumentId,
      });
      if (res.data === "") {
        setIsLoading(false);
        router.push(
          `/pay-to/created?reference=${searchParams.get("reference")}`
        );
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

  async function getCustomerDetails(
    token: string,
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
        token,
        customerId,
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
        token,
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

  async function getAgreementDetails(token: string) {
    try {
      const res = await axios.post("/api/agreement-details", {
        token,
        reference: searchParams.get("reference"),
      });
      // display error if the request is inactive
      if(res.data?.value[0].statecode == 1) {
        router.push(
          `/pay-to/review?reference=${searchParams.get("reference")}&type=1`
        );
      }

      setAgreementData(res.data?.value[0]?.mec_PaymentArrangement);
      setPaymentData(res.data?.value[0]?.mec_Payment);
      setRequestType(res.data?.value[0]?.mec_requesttype);
      setCustomerId(res.data?.value[0]?.mec_customerrequestid);
      setPaymentArrangementId(
        res.data?.value[0]?.mec_requesttype === 179050000
          ? res.data?.value[0]?._mec_payment_value
          : res.data?.value[0]?._mec_paymentarrangement_value
      );

      if (res.data?.value[0]?.mec_RequestedBy?._mec_contact_value) {
        setContactId(res.data?.value[0]?.mec_RequestedBy?._mec_contact_value);
      }

      apiLogging(
        token,
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
        token,
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

  async function getToken() {
    try {
      const res = await axios("/api/token");
      getAgreementDetails(res.data.token.access_token);
      setStateToken(res.data.token.access_token);
      localStorage.setItem("accessToken", res.data.token.access_token);
      localStorage.setItem("reference", searchParams.get("reference") || "");
    } catch (error) {
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
    if (contactId && stateToken && customerId) {
      getCustomerDetails(stateToken || "", contactId, customerId || "");
    }
  }, [contactId, customerId, stateToken]);

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
          <Loader />
        )}
      </div>
      <div className="mx-auto w-full rounded-xl border border-gray-100 bg-pa-background-box p-4 shadow-md md:w-5/12 space-y-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelected("payto")}
          className="flex flex-row mx-auto w-full rounded-2xl border border-gray-100 p-4 shadow-md bg-white"
        >
          <div className="w-1/12 mr-2">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="circle"
              className="svg-inline--fa fa-circle border-2 h-5 w-5 rounded-full p-0.5 border-pa-button-dark mx-auto mt-1"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              {selected === "payto" && (
                <path
                  fill="#054365"
                  d="M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256z"
                />
              )}
            </svg>
          </div>
          <div className="w-11/12">
            <div className="flex justify-between">
              <div className="text-xl font-bold">PayTo</div>
              <Image
                src="/images/pay-to-logo.png"
                alt="pay-to logo"
                width={60}
                height={90}
              />
            </div>
            <div className="text-base text-gray-500 mt-1 w-3/4">
              Immediate, easy and secure payment from your bank account.
            </div>
            {selected === "payto" && (
              <div className="flex flex-col justify-center pb-2">
                <div className="flex flex-col">
                  <div className="mx-auto mt-3 w-full">
                    <div className="mb-2 space-y-2">
                      <div className="w-full">
                        <label
                          htmlFor="accountNumber"
                          className="mb-2 block text-base font-semibold text-pa-normal"
                        >
                          Account Name
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder=""
                          id="accountName"
                          className={classNames(
                            "ease w-full rounded-md border border-pa-border bg-transparent px-3 py-2 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
                            accountNameError && "focus:border-pa-primary"
                          )}
                          maxLength={50}
                          value={accountName}
                          onChange={handleAccountName}
                          onBlur={handleAccountName}
                        />
                        {accountNameError ? (
                          <p className="text-pa-danger text-xs mt-1">
                            {accountNameError}
                          </p>
                        ) : null}
                      </div>
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
                              placeholder=""
                              id="bsb"
                              className={classNames(
                                "ease w-full rounded-md border border-pa-border bg-transparent px-3 py-2 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
                                bsbError && "focus:border-pa-primary"
                              )}
                              maxLength={7}
                              value={bsb}
                              onChange={handleChangeBsb}
                              onBlur={handleChangeBsb}
                            />
                            {bsbError ? (
                              <p className="text-pa-danger text-xs mt-1">
                                {bsbError}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="w-8/12">
                          <div className="w-full">
                            <label
                              htmlFor="accountNumber"
                              className="mb-2 block text-base font-semibold text-pa-normal"
                            >
                              Account Number
                            </label>

                            <input
                              type="text"
                              autoComplete="off"
                              placeholder=""
                              id="accountNumber"
                              className={classNames(
                                "ease w-full rounded-md border border-pa-border bg-transparent px-3 py-2 text-sm text-pa-normal shadow-sm transition duration-300 placeholder:text-slate-400 focus:shadow focus:outline-none",
                                accountNumberError && "focus:border-pa-primary"
                              )}
                              maxLength={10}
                              value={accountNumber}
                              onChange={handleAccountNumber}
                              onBlur={handleAccountNumber}
                            />
                            {accountNumberError ? (
                              <p className="text-pa-danger text-xs mt-1">
                                {accountNumberError}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PayToInfo />
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelected("card")}
          className="flex flex-row mx-auto w-full rounded-2xl border border-gray-100 p-4 shadow-md bg-white"
        >
          <div className="flex w-1/12 mr-2">
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="circle"
              className="svg-inline--fa fa-circle border-2 h-5 w-5 rounded-full p-0.5 border-pa-button-dark m-auto"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              {selected === "card" && (
                <path
                  fill="#054365"
                  d="M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256z"
                />
              )}
            </svg>
          </div>
          <div className="w-11/12">
            <div className="flex justify-between">
              <div className="text-xl font-bold my-auto">Credit or Debit</div>
              <div className="flex flex-row space-x-2">
                <div className="flex border border-gray-50 rounded-md p-1">
                  <Image
                    src="/images/visa.png"
                    alt="visa"
                    className="m-auto"
                    width={50}
                    height={100}
                  />
                </div>
                <div className="flex border border-gray-50 rounded-md p-1 h-10">
                  <Image
                    src="/images/mastercard.png"
                    alt="mastercard"
                    width={50}
                    height={100}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {bsb === "" ||
          accountName === "" ||
          accountNumber === "" ||
          accountNumber.length < 6 ||
          bsb.length < 7 ? (
          <Button
            label="Continue"
            containerClassName="pt-2 w-full md:w-1/2 mx-auto"
            variant="disabled"
          />
        ) : (
          <Button
            label="Continue"
            containerClassName="pt-2 w-full md:w-1/2 mx-auto"
            variant="button-dark"
            isLoading={isLoading}
            onClick={handleContinue}
          />
        )}
        <div className="text-sm px-10 pb-5 text-justify">
          {`By clicking "Continue" I confirm I have read and accept the terms and conditions associated with submitting this application online. By submitting this form for processing I request and authorise Global Payments, T/A Ezidebit on behalf of 365 Collect, to debit my/our nominated bank account through an established PayTo agreement. If available, the PayTo agreement is not finalised until the agreement is authorised inside my internet banking. I/We must pay you when the bill is due under the arrangement between us.`}
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
