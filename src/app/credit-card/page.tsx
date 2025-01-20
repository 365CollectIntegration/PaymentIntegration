"use client";

import axios from "axios";

import { useExternalScript } from "../../hooks/useExternalScript";
import { useEffect, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const GPAUNZ: any;

export default function CreditCard() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(function onMount() {
    setIsLoading(true);
  }, []);

  useExternalScript({
    url: "https://rapid-api-hosted.prod.ewaylabs.cloud/static/securepanel/js/securepanel.min.js",
    onLoad: async () => {
      const token = await getOneTimeToken();
      processInitialization(token, onInitialized);
    },
  });

  function onInitialized(response: any) {
    setIsLoading(false);
    console.log("on credit card initialization response", response);
  }

  return (
    <div>
      {isLoading ? <div>Credit card form loading...</div> : null}
      <div id="secure-panel"></div>
    </div>
  );
}

function processInitialization(
  token: string,
  onInitializationCb: (response: any) => void
) {
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

  GPAUNZ.SecurePanel.initialise(config, null, onInitializationCb);
}

async function getOneTimeToken() {
  try {
    const res = await axios("/api/secure-panel-token");
    return res.data?.token ?? "";
  } catch (error) {
    console.error(error);
  }
}
