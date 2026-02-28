import { ConnectWallet } from "../components/ConnectWallet";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md flex flex-col items-center">
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 shadow-2xl shadow-blue-500/30 flex items-center justify-center transform -rotate-6">
                        <span className="text-4xl">🎁</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Gifty</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                        Link your wallet to the Telegram bot to enable seamless 1-click group pooling on Circle Arc.
                    </p>
                </div>

                <div className="w-full">
                    <ConnectWallet />
                </div>
            </div>
        </main>
    );
}
