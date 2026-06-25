import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Info, Check, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function QrCodeView() {
  const [businessUrl, setBusinessUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUrl = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().reviewUrl) {
            setBusinessUrl(docSnap.data().reviewUrl);
            setInputUrl(docSnap.data().reviewUrl);
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
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "meu_qr_code_avaliacoes.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <p className="text-gray-500 mb-8 max-w-md">
          Conecte o seu link de avaliações do Google Meu Negócio e deixe seus clientes escanearem o QR Code.
        </p>

        {!businessUrl ? (
          <div className="w-full max-w-md bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2 text-left">
              Seu Link de Avaliações do Google
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={18} className="text-gray-400" />
                </div>
                <input 
                  type="url" 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Ex: https://g.page/r/XYZ/review"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSaveUrl}
                disabled={saving || !inputUrl}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Gerar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 inline-block">
              {/* To allow downloading via canvas, we can use qrcode.react with canvas rendering */}
              <QRCodeSVG 
                id="qr-gen"
                value={businessUrl}
                size={240}
                level="H"
                includeMargin={true}
                fgColor="#1e3a8a" // text-blue-900
              />
            </div>
            
            <div className="flex items-center gap-2 mb-8 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Check size={16} />
              QR Code pronto para uso!
            </div>

            <div className="flex w-full max-w-sm gap-4 mb-6">
              <button 
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-colors"
              >
                <Download size={20} />
                Baixar
              </button>
              <button 
                onClick={() => setBusinessUrl("")}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border border-gray-200 transition-colors"
              >
                <RefreshCw size={20} />
                Alterar Link
              </button>
            </div>
          </>
        )}

        {/* Informações Adicionais linking to Course Module */}
        <div className="w-full max-w-md mt-4 pt-6 border-t border-gray-100">
          <Link to="/dicas" state={{ openModuleId: 5 }} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl transition-colors">
            <Info size={20} />
            Informações Adicionais (Módulo de Avaliações)
          </Link>
        </div>

      </div>
    </div>
  );
}
