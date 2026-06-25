import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Info, Check, Link as LinkIcon, RefreshCw, Store } from "lucide-react";
import { Link } from "react-router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function QrCodeView() {
  const [businessUrl, setBusinessUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUrl = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.reviewUrl) {
              setBusinessUrl(data.reviewUrl);
              setInputUrl(data.reviewUrl);
            }
            if (data.businessData?.title) {
              setBusinessName(data.businessData.title);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar URL:", error);
        }
      }
      setLoading(false);
    };

    fetchUrl();
  }, [user]);

  const handleSaveUrl = async () => {
    if (!user || !inputUrl) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { reviewUrl: inputUrl }, { merge: true });
      setBusinessUrl(inputUrl);
    } catch (error) {
      console.error("Erro ao salvar URL:", error);
    } finally {
      setSaving(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen") as HTMLCanvasElement;
    if (canvas) {
      // Create a new canvas to draw the white background and then the QR code
      const newCanvas = document.createElement('canvas');
      newCanvas.width = canvas.width + 40;
      newCanvas.height = canvas.height + 40;
      const ctx = newCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        ctx.drawImage(canvas, 20, 20);
        
        const pngUrl = newCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "meu_qr_code_avaliacoes.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 py-4">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">QR Code de Avaliações</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-8 pt-10 pb-12 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl flex items-center justify-center mb-6">
            <Store size={28} className="text-teal-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Mais avaliações, mais clientes</h2>
          <p className="text-gray-500 mb-10 max-w-sm text-sm leading-relaxed">
            Deixe o QR Code visível no seu balcão ou nas mesas. Facilite para seus clientes deixarem uma avaliação 5 estrelas em segundos.
          </p>

          {!businessUrl ? (
            <div className="w-full max-w-md bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">
                Seu Link de Avaliações do Google
              </label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="url" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Ex: https://g.page/r/XYZ/review"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm bg-white"
                  />
                </div>
                <button 
                  onClick={handleSaveUrl}
                  disabled={saving || !inputUrl}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? 'Salvando...' : 'Gerar QR Code'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              
              {businessName && (
                <div className="mb-6 py-2 px-4 bg-gray-50 rounded-full border border-gray-100 text-sm font-medium text-gray-700">
                  {businessName}
                </div>
              )}

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 inline-block relative group transition-all hover:shadow-md">
                <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-[2rem] m-2 pointer-events-none"></div>
                <QRCodeCanvas 
                  id="qr-gen"
                  value={businessUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a" // slate-900
                />
              </div>
              
              <div className="flex items-center gap-2 mb-10 text-teal-700 bg-teal-50 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Check size={14} />
                Pronto para imprimir
              </div>

              <div className="flex flex-col sm:flex-row w-full max-w-sm gap-3">
                <button 
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <Download size={18} />
                  Baixar Imagem
                </button>
                <button 
                  onClick={() => setBusinessUrl("")}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
                >
                  <RefreshCw size={18} />
                  Alterar Link
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Area */}
        <div className="border-t border-gray-50 bg-gray-50/50 p-6">
          <Link to="/dicas" state={{ openModuleId: 5 }} className="group flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all shadow-sm hover:shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                <Info size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">Como usar o QR Code</h3>
                <p className="text-xs text-gray-500">Acesse o módulo do curso</p>
              </div>
            </div>
            <ArrowLeft size={16} className="text-gray-400 rotate-180 group-hover:text-gray-900 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
