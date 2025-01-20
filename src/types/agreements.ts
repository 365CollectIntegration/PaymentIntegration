export interface AgreementDataProps {
  mec_finalpaymentamount: number;
  mec_totalamount: number;
  mec_firstpromisedate: string;
  mec_lastpromisedate: string;
  mec_numberofpayments: number;
  mec_paymentfrequency: number;
  mec_promiseamount: number;
  mec_promisetopayid: string;
  _transactioncurrencyid_value: string;
}

export interface ContactProps {
  _mec_contact_value: string;
  mec_relatedpartiesid: string;
}
