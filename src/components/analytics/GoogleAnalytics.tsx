"use client";

import React from "react";
import Script from "next/script";

export default function GoogleAnalytics({
  gaId = "G-4YDHNQ6JPF",
}: {
  gaId?: string;
}) {
  const activeGaId = gaId || "G-4YDHNQ6JPF";

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${activeGaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${activeGaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
