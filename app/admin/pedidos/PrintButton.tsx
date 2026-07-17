'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-xs text-[#1c2b4b] border border-[#1c2b4b] px-3 py-1.5 rounded-lg font-medium hover:bg-[#1c2b4b] hover:text-white transition-colors"
    >
      Imprimir
    </button>
  )
}
