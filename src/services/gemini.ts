import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with the API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeReport = async (file: File): Promise<any> => {
    try {
        // Debug: Log the API key status (masked)
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        console.log("Debug - API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");

        if (!apiKey) {
            throw new Error("API key is missing in environment variables");
        }

        // Using gemini-2.5-flash as verified by test script
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Convert file to base64
        const base64Data = await fileToBase64(file);

        const prompt = `You are a medical AI assistant. Analyze this medical report and extract information into a strict JSON format.

        Output MUST be a valid JSON object with this exact structure:
        {
          "summary": "A very short, simple paragraph (max 3 sentences) summarizing the report. Focus on the main diagnosis and key status.",
          "findings": [
            {
              "label": "Test Name or Observation",
              "value": "Result Value",
              "status": "good" | "warning" | "neutral"
            }
          ],
          "medications": [
            {
              "name": "Medicine Name",
              "dosage": "Dosage (e.g., 500mg)",
              "time": "Timing (e.g., Morning, Night)",
              "duration": "Duration (e.g., 5 days)"
            }
          ],
          "patientDetails": {
            "name": "Patient Name",
            "age": "Age",
            "gender": "Gender"
          }
        }

        IMPORTANT RULES:
        1. Return ONLY the raw JSON string. Do NOT use markdown code blocks.
        2. Keep the "summary" extremely concise and simple.
        3. If a field is not found, use null or empty array [].
        4. "status" for findings should be inferred: "warning" for abnormal, "good" for normal.
        5. Extract ALL medications listed.`;

        const imageParts = [
            {
                inlineData: {
                    data: base64Data.split(',')[1], // Remove data:image/...;base64, prefix
                    mimeType: file.type
                }
            }
        ];

        console.log("Debug - Sending request to Gemini API...");
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        console.log("Debug - Received response from Gemini API:", text);

        // Clean up the response if it contains markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            // Fallback to basic text if JSON parsing fails
            return {
                summary: text,
                findings: [],
                medications: [],
                patientDetails: null
            };
        }
    } catch (error: any) {
        console.error("Error analyzing report:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));

        // Provide more specific error messages
        if (error.message?.includes('API key') || error.status === 404) {
            throw new Error("Invalid API Key or API not enabled. Please check your Google AI Studio settings.");
        } else if (error.message?.includes('quota')) {
            throw new Error("API quota exceeded. Please try again later.");
        } else {
            throw new Error(`Failed to analyze report: ${error.message}`);
        }
    }
};

export const chatWithReport = async (reportContext: string, userMessage: string, chatHistory: Array<{ role: string, content: string }>): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build conversation history
        const conversationContext = `You are a helpful medical AI assistant. You are helping a patient understand their medical report.

Report Context: ${reportContext}

Previous conversation:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Patient's question: ${userMessage}

Please provide a clear, empathetic, and helpful response. If the question is about medication dosage or serious medical concerns, remind them to consult their doctor.`;

        const result = await model.generateContent(conversationContext);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Error in chat:", error);

        if (error.message?.includes('API key')) {
            throw new Error("Please check your API key and try again.");
        } else {
            throw new Error("Failed to get response. Please try again.");
        }
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default { analyzeReport, chatWithReport };
