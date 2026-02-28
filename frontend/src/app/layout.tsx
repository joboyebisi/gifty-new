import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TelegramProvider } from "./telegram-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gifty | Group Pooling on Circle Arc",
    description: "Agent-powered Telegram bot for seamless group pool contributions.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen`}>
                <TelegramProvider>
                    <Providers>
                        {children}
                    </Providers>
                </TelegramProvider>
            </body>
        </html>
    );
}
