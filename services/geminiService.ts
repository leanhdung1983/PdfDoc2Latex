
import { GoogleGenAI } from "@google/genai";
import { UploadedFile, FileType } from "../types";
import { cleanLatexOutput, extractHtmlFromDocx } from "../utils/fileUtils";

// Khởi tạo client mới cho mỗi yêu cầu để đảm bảo dùng API Key mới nhất nếu có thay đổi
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là một chuyên gia soạn thảo LaTeX đỉnh cao, chuyên về định dạng 'ex_test' và 'bt_ex' cho đề thi Việt Nam.
NHIỆM VỤ TỐI THƯỢNG: Chuyển đổi TOÀN BỘ tài liệu được cung cấp sang mã LaTeX. 

QUY TẮC NGHIÊM NGẶT:
1. KHÔNG ĐƯỢC TÓM TẮT: Phải chuyển đổi từng dòng, từng câu hỏi, không bỏ sót bất kỳ chi tiết nào từ đầu đến cuối tài liệu.
2. KHÔNG ĐƯỢC DỪNG GIỮA CHỪNG: Nếu tài liệu dài, hãy phân bổ cấu trúc hợp lý để hoàn thành toàn bộ.
3. CẤU TRÚC EX_TEST:
   - Mỗi câu hỏi: \\begin{ex} ... \\loigiai{...} \\end{ex}.
   - Trắc nghiệm 4 lựa chọn: \\choice{.A}{B}{C}{D} (dấu chấm trước đáp án đúng).
   - Đúng/Sai: \\choiceTF{.D}{S}{.D}{S} (D: Đúng, S: Sai).
   - Trả lời ngắn: \\shortans{Kết quả}.
4. TOÁN HỌC: Sử dụng môi trường $...$ hoặc \\[ ... \\] cho mọi công thức.
5. HÌNH ẢNH: Nếu thấy hình ảnh/đồ thị, dùng \\centerline{\\includegraphics[width=0.6\\linewidth]{placeholder}} kèm chú thích.

Hãy dành thời gian suy nghĩ về cấu trúc toàn bộ đề thi trước khi bắt đầu xuất mã LaTeX.
`;

export const convertDocToLatex = async (file: UploadedFile): Promise<string> => {
  try {
    const ai = getAIClient();
    const modelId = 'gemini-3-pro-preview';
    let parts: any[] = [];

    if (file.type === FileType.DOCX) {
      const htmlContent = await extractHtmlFromDocx(file.base64Data);
      parts = [
        {
          text: `Dưới đây là nội dung HTML chiết xuất từ file Word. Hãy chuyển đổi TOÀN BỘ sang LaTeX ex_test, giữ nguyên mọi câu hỏi:\n\n${htmlContent}`
        }
      ];
    } else {
      parts = [
        {
          inlineData: {
            mimeType: file.type,
            data: file.base64Data
          }
        },
        {
          text: "Chuyển đổi TOÀN BỘ file PDF này sang mã LaTeX ex_test. Đọc kỹ tất cả các trang, không bỏ sót bất kỳ câu hỏi nào. Phân loại đúng dạng: Trắc nghiệm, Đúng/Sai, Trả lời ngắn."
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Cấu hình Thinking để AI lập kế hoạch trước khi viết, giúp xử lý file dài tốt hơn
        thinkingConfig: { 
          thinkingBudget: 16000 
        },
        // Tăng giới hạn đầu ra để chứa được toàn bộ đề thi
        maxOutputTokens: 32000, 
        temperature: 0.1,
      }
    });

    const rawText = response.text;
    
    if (!rawText) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'MAX_TOKENS') {
        return cleanLatexOutput(candidate.content.parts[0].text || "") + "\n\n% CẢNH BÁO: Nội dung quá dài nên đã bị cắt ngắn bởi giới hạn Token.";
      }
      throw new Error(candidate?.finishReason ? `Lỗi AI (${candidate.finishReason})` : "Không nhận được phản hồi từ AI.");
    }

    return cleanLatexOutput(rawText);

  } catch (error: any) {
    console.error("Gemini conversion error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Lỗi API Key. Vui lòng kiểm tra lại cấu hình.");
    }
    throw new Error(error.message || "Không thể chuyển đổi tài liệu. Vui lòng thử lại với file nhỏ hơn hoặc ít trang hơn.");
  }
};
