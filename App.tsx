
import React, { useState } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import CodeEditor from './components/CodeEditor';
import { UploadedFile, ProcessingStatus } from './types';
import { convertDocToLatex } from './services/geminiService';
import { Loader2, BookOpen, CheckCircle2, Zap, Target, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: UploadedFile) => {
    setFile(selectedFile);
    setStatus(ProcessingStatus.PROCESSING);
    setErrorMsg(null);

    try {
      const code = await convertDocToLatex(selectedFile);
      setLatexCode(code);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (error: any) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setErrorMsg(error.message || "Đã xảy ra lỗi không xác định.");
    }
  };

  const handleReset = () => {
    setStatus(ProcessingStatus.IDLE);
    setFile(null);
    setLatexCode('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {status === ProcessingStatus.IDLE && (
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Doc2LaTeX <span className="text-primary-600">Ultra</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Sử dụng AI Reasoning (Gemini 3 Pro) để chuyển đổi toàn bộ đề thi sang định dạng <b>ex_test</b> chuyên nghiệp, không bỏ sót nội dung.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
               <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 text-blue-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Chính xác cao</p>
                    <p className="text-xs text-slate-500">Nhận diện công thức tốt</p>
                  </div>
               </div>
               <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mr-3 text-amber-600">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">AI Reasoning</p>
                    <p className="text-xs text-slate-500">Phân tích toàn bộ trang</p>
                  </div>
               </div>
               <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3 text-purple-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Đầy đủ định dạng</p>
                    <p className="text-xs text-slate-500">Trắc nghiệm, Đ/S, Ngắn</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
          
          <div className={`lg:col-span-4 flex flex-col gap-6 transition-all duration-500 ${status === ProcessingStatus.COMPLETED ? '' : 'lg:col-start-4 lg:col-span-6'}`}>
            
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Tải đề thi lên</h2>
                {status === ProcessingStatus.COMPLETED && (
                    <button onClick={handleReset} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Tạo mới
                    </button>
                )}
              </div>
              
              {status === ProcessingStatus.IDLE || status === ProcessingStatus.ERROR ? (
                 <FileUploader onFileSelect={handleFileSelect} isLoading={false} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                        {status === ProcessingStatus.COMPLETED ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                            <BrainCircuit className="w-8 h-8 text-primary-500 animate-pulse" />
                        )}
                    </div>
                    <p className="font-medium text-slate-900 truncate max-w-full px-2">{file?.name}</p>
                    
                    {status === ProcessingStatus.PROCESSING && (
                        <div className="mt-6 w-full">
                            <div className="flex items-center justify-center gap-2 text-primary-600 mb-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium italic">AI đang phân tích & lập kế hoạch...</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 animate-progress w-full origin-left"></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-wider font-semibold">
                              Có thể mất 1-2 phút cho file nhiều trang
                            </p>
                        </div>
                    )}

                     {status === ProcessingStatus.COMPLETED && (
                        <div className="mt-6 w-full p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Chuyển đổi hoàn tất!
                        </div>
                    )}
                </div>
              )}

              {status === ProcessingStatus.ERROR && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                    <p className="font-bold mb-1">Lỗi xảy ra:</p>
                    <p className="opacity-90">{errorMsg}</p>
                    <button 
                        onClick={() => setStatus(ProcessingStatus.IDLE)}
                        className="mt-3 text-red-800 underline font-medium hover:text-red-900"
                    >
                        Thử lại ngay
                    </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                <BrainCircuit className="w-4 h-4 mr-2" /> Mẹo xử lý file dài
              </h4>
              <ul className="text-xs text-blue-700 space-y-2 list-disc ml-4">
                <li>Nếu PDF có hơn 10 trang, hãy tách nhỏ để đạt chất lượng tốt nhất.</li>
                <li>Đảm bảo file PDF có độ phân giải rõ nét để AI đọc được công thức.</li>
                <li>Hệ thống ưu tiên giữ nguyên cấu trúc toán học phức tạp.</li>
              </ul>
            </div>
          </div>

          {status === ProcessingStatus.COMPLETED && (
            <div className="lg:col-span-8 animate-fade-in-up h-[600px] lg:h-auto">
              <CodeEditor code={latexCode} filename={file?.name || 'dethi.tex'} />
            </div>
          )}

        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Doc2LaTeX Pro. Công nghệ Reasoning AI chuyển đổi tài liệu thông minh.</p>
        </div>
      </footer>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          20% { transform: scaleX(0.3); }
          60% { transform: scaleX(0.7); }
          100% { transform: scaleX(0.95); }
        }
        .animate-progress {
          animation: progress 45s cubic-bezier(0.1, 0.5, 0.5, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
