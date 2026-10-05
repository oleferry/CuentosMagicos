import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "✨ CuentoMágico",
  description: "Aventuras que enseñan, con tu hijo de protagonista",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6B35",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={nunito.variable}>
      <head>
        {/* Letra de los cuentos: ligada escolar (Playwrite ES) o imprenta para
            primeros lectores (Andika, con «a» y «g» de una sola panza). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Andika&family=Playwrite+ES:wght@100..400&display=swap"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
