'use client'

import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { useState } from 'react'

export function ConnectWallet() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()
    const [permissionsGranted, setPermissionsGranted] = useState(false)

    if (isConnected) {
        return (
            <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-3 w-full justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-300">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                    </div>
                    <button
                        onClick={() => disconnect()}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>

                {!permissionsGranted ? (
                    <div className="w-full mt-2">
                        <h3 className="text-lg font-semibold text-white mb-2">Authorize Gifty Bot</h3>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            To enable seamless group pooling in Telegram, Gifty needs permission to transfer USDC on your behalf up to a limit you set.
                        </p>
                        <button
                            onClick={() => setPermissionsGranted(true)} // Mock for now, will implement actual ERC-7715 call
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                            Grant ERC-7715 Permissions
                        </button>
                    </div>
                ) : (
                    <div className="w-full mt-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Permissions Granted!</span>
                        </div>
                        <p className="text-xs text-emerald-500/80 mt-1">
                            You can now return to Telegram and use the /pool command.
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
            {connectors.map((connector) => (
                <button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    className="flex items-center justify-between w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all shadow-xl group"
                >
                    <span className="font-medium text-slate-200 group-hover:text-white">
                        Connect {connector.name}
                    </span>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            ))}
        </div>
    )
}
