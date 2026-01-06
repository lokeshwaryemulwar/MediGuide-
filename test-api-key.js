// Quick test to verify the Gemini API key
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDMzSbit_QR1A0KA1g6qLcLWFAgrMgPcv0";

async function testAPIKey() {
    try {
        console.log("Testing API key:", API_KEY.substring(0, 10) + "...");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Say hello");
        const response = await result.response;
        const text = response.text();

        console.log("✅ API Key is VALID!");
        console.log("Response:", text);
    } catch (error) {
        console.error("❌ API Key test FAILED:");
        console.error("Error:", error.message);
        console.error("Full error:", error);
    }
}

testAPIKey();
