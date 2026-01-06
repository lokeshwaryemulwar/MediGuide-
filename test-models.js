import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDMzSbit_QR1A0KA1g6qLcLWFAgrMgPcv0";
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash" // User suggested this
];

async function testModels() {
    console.log("Testing API Key with different models...");

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`✅ SUCCESS! Model '${modelName}' is working.`);
            console.log(`Response: ${response.text()}`);
            return; // Stop after finding a working model
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            if (error.status === 404) {
                console.log("Error: 404 Not Found (Invalid model or API key)");
            } else {
                console.log(`Error: ${error.message}`);
            }
        }
    }

    console.log("\n❌ All models failed. Please check your API key.");
}

testModels();
