require("dotenv").config({ path: "c:/Users/lithi/Downloads/resumeiq_fullstack/resumeiq/backend/.env" });
const { getAIChatResponse } = require("c:/Users/lithi/Downloads/resumeiq_fullstack/resumeiq/backend/services/aiService.js");

async function test() {
  console.log("🚀 Testing getAIChatResponse...");
  try {
    const res = await getAIChatResponse("How can I improve my resume for a Software Engineer role?");
    console.log("✅ Success! Response:\n", res);
  } catch (err) {
    console.error("❌ Test Failed:", err.message);
  }
}

test();
