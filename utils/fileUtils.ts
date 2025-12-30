import { FileType } from '../types';
import mammoth from 'mammoth';

export const getFileType = (file: File): FileType => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (file.type === 'application/pdf' || extension === 'pdf') {
    return FileType.PDF;
  }
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    return FileType.DOCX;
  }
  return FileType.UNKNOWN;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const cleanLatexOutput = (text: string): string => {
  // Remove markdown code fences if present
  let cleaned = text.replace(/^```latex\n/i, '').replace(/^```tex\n/i, '').replace(/^```\n/i, '');
  cleaned = cleaned.replace(/\n```$/i, '');
  return cleaned.trim();
};

export const extractHtmlFromDocx = async (base64: string): Promise<string> => {
  try {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    return result.value; // The generated HTML
  } catch (error) {
    console.error("Error extracting HTML from DOCX:", error);
    throw new Error("Không thể đọc nội dung file DOCX. Hãy đảm bảo file không bị lỗi.");
  }
};