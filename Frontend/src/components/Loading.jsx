function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 px-10 py-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative">
                {/* Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 opacity-20 blur-2xl"></div>
                {/* Animated Loader */}
                <div className="relative flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="w-16 h-16 border-[3px] border-white/10 rounded-full"></div>
                    {/* Rotating Gradient Ring */}
                    <div className="absolute w-16 h-16 border-[3px] border-t-indigo-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    {/* Inner Pulse Dot */}
                    <div className="absolute w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
                </div>
                {/* Text */}
                <p className="text-gray-300 text-sm tracking-wide">
                    Loading...
                </p>
            </div>
        </div>
    );
}

export default Loading;