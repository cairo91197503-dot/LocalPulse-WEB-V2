import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Link } from "react-router";

export default function QrCodeView() {
  const businessUrl = "https://g.page/r/YOUR_BUSINESS_ID/review";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 py-2">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">QR Code de Avaliações</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mais avaliações, mais clientes</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Peça para seus clientes escanearem este QR Code para deixarem uma avaliação no Google.
        </p>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 inline-block">
          <QRCodeSVG 
            value={businessUrl}
            size={240}
            level="H"
            includeMargin={true}
            fgColor="#1e3a8a" // text-blue-900
          />
        </div>

        <div className="flex w-full max-w-sm gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors">
            <Download size={20} />
            Baixar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border border-gray-200 transition-colors">
            <Share2 size={20} />
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}
