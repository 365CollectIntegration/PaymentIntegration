export interface AgreementDataProps {
  mec_finalpaymentamount: number;
  mec_totalamount: number;
  mec_firstpromisedate: string;
  mec_lastpromisedate: string;
  mec_numberofpayments: number;
  mec_paymentfrequency: number;
  mec_promiseamount: number;
  mec_promisetopayid: string;
  mec_referencenumber: string;
  mec_gppaymentinstrumentid: string;
  _transactioncurrencyid_value: string;
}

export interface PaymentDataProps {
  mec_referencenumber: string;
  mec_duedate: string;
  mec_amountpaid: number;
}

export interface ContactProps {
  _mec_contact_value: string;
  mec_relatedpartiesid: string;
}
