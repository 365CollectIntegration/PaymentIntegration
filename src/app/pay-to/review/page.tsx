"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/Button";

function PayToReview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="mx-auto mt-3 w-full md:w-5/12">
      <div className="my-5 rounded-xl border border-gray-100 p-4 shadow-md md:p-10 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 16 16"
          className="mx-auto"
        >
          <g fill="none">
            <path
              fill="url(#fluentColorWarning160)"
              d="M9.092 2.638a1.25 1.25 0 0 0-2.182 0L2.157 11.14A1.25 1.25 0 0 0 3.247 13h9.504a1.25 1.25 0 0 0 1.091-1.86z"
            />
            <path
              fill="url(#fluentColorWarning161)"
              d="M8.75 10.25a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0M7.5 8V5.5a.5.5 0 0 1 1 0V8a.5.5 0 0 1-1 0"
            />
            <defs>
              <linearGradient
                id="fluentColorWarning160"
                x1="3.872"
                x2="10.725"
                y1=".279"
                y2="14.525"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ffcd0f" />
                <stop offset="1" stopColor="#fe8401" />
              </linearGradient>
              <linearGradient
                id="fluentColorWarning161"
                x1="6"
                x2="8.466"
                y1="5"
                y2="11.575"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4a4a4a" />
                <stop offset="1" stopColor="#212121" />
              </linearGradient>
            </defs>
          </g>
        </svg>
        <div className="text-2xl font-semibold mb-3">
          Something went wrong with your request.
        </div>
        <div className="text-gray-500 mb-3">
          Please check your payment details and try again. If the issue persists, contact support.
        </div>
        <Button
          label="Retry"
          containerClassName="pt-2 w-full md:w-1/2 mx-auto"
          variant="button-light"
          onClick={() => {
            router.push(`/?reference=${searchParams.get("reference")}`);
          }}
        />
      </div>
    </div>
  );
}

export default function PayToReviewPage() {
  return (
    <Suspense>
      <PayToReview />
    </Suspense>
  );
}
