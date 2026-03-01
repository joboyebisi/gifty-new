'use client'

import { useEffect } from 'react'
import { init } from '@telegram-apps/sdk'

declare global {
    interface Window {
        TelegramWebviewProxy: any;
    }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const isDevelopment = process.env.NODE_ENV === 'development'

    useEffect(() => {
        if (!isDevelopment && typeof window !== 'undefined' && window.TelegramWebviewProxy) {
            try {
                init()
            } catch (e) {
                console.error("Telegram SDK init failed", e)
            }
        }
    }, [isDevelopment])

    return <>{children}</>
}
