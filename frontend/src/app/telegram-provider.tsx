'use client'

import { WebAppProvider } from '@telegram-apps/sdk-react'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    // Use a mock provider for local development outside the Telegram app
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && typeof window !== 'undefined' && !window.TelegramWebviewProxy) {
        return <>{children}</>
    }

    return (
        <WebAppProvider options={{ acceptCustomStyles: true }}>
            {children}
        </WebAppProvider>
    )
}
