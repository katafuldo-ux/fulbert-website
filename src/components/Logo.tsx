import { Zap, Cpu, Wifi } from 'lucide-react'

export default function Logo({ size = "large" }: { size?: "small" | "large" }) {
  const sizeClass = size === "large" ? "w-16 h-16" : "w-10 h-10"
  const textSize = size === "large" ? "text-2xl" : "text-lg"
  const subTextSize = size === "large" ? "text-sm" : "text-xs"
  
  return (
    <div className="flex items-center space-x-3">
      <div className={`relative ${sizeClass} bg-gradient-to-br from-blue-700 via-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-xl border border-blue-800/20`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl"></div>
        <div className="relative flex items-center space-x-0.5">
          <Zap className="w-6 h-6 text-white drop-shadow-sm" />
          <div className="w-px h-4 bg-white/60"></div>
          <Cpu className="w-5 h-5 text-white drop-shadow-sm" />
          <div className="w-px h-4 bg-white/60"></div>
          <Wifi className="w-4 h-4 text-white drop-shadow-sm" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className={`font-bold ${textSize} bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent leading-tight`}>
          FULBERT-ASKY
        </div>
        <div className={`${subTextSize} text-gray-600 font-medium leading-tight`}>
          INGÉNIERIE
        </div>
      </div>
    </div>
  )
}
