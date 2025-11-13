export const metadata = {
  title: "STEMI Detector",
  description: "Educational STEMI detection demo (not for clinical use)",
};

import "./globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container">
          <h1>STEMI Detector</h1>
          <p className="muted">Educational demo. Not medical advice.</p>
        </header>
        <main className="container">{children}</main>
        <footer className="container footer">
          <small>
            This tool is for educational purposes only and is not a
            substitute for professional medical judgment.
          </small>
        </footer>
      </body>
    </html>
  );
}
