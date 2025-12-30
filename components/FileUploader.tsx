import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType as FileTypeIcon, AlertCircle } from 'lucide-react';
import { FileType, UploadedFile } from '../types';
import { fileToBase64, getFileType } from '../utils/fileUtils';

interface FileUploaderProps {
  onFileSelect: (file: UploadedFile) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setError(null);
    
    // Check specific file extension for better error messaging
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'doc') {
      setError("File .doc (Word 97-2003) không được hỗ trợ. Vui lòng đổi sang .docx hoặc PDF.");
      return;
    }

    const type = getFileType(file);
    
    if (type === FileType.UNKNOWN) {
      setError("Định dạng file không hỗ trợ. Vui lòng tải lên PDF hoặc Word (.docx).");
      return;
    }

    // Limit to 10MB to ensure stability
    if (file.size > 10 * 1024 * 1024) { 
      setError("File quá lớn. Vui lòng tải lên file nhỏ hơn 10MB để đảm bảo xử lý tốt nhất.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onFileSelect({
        name: file.name,
        type: type,
        size: file.size,
        base64Data: base64
      });
    } catch (err) {
      setError("Lỗi khi đọc file.");
      console.error(err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
            <UploadCloud className="w-10 h-10" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Kéo thả hoặc chọn tài liệu
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">
            Hỗ trợ PDF và Word (.docx).<br/>Tối đa 10MB.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
            <FileTypeIcon className="w-3 h-3" />
            <span>AI xử lý an toàn & bảo mật</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;