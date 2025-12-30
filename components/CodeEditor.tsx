import React, { useRef } from 'react';
import { Copy, Download, Check, FileCode } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  filename: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, filename }) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename.split('.')[0]}.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                <FileCode size={18} />
            </div>
            <span className="font-medium text-sm text-gray-700">Kết quả LaTeX</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Tải xuống .tex
          </button>
        </div>
      </div>
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-relaxed text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 custom-scrollbar bg-[#f8fafc]"
          value={code}
          readOnly
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;