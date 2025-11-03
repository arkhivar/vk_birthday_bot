
import { mastra } from "./src/mastra";

async function testBirthdayWorkflow() {
  console.log("🧪 Testing birthday workflow...");
  
  try {
    const workflow = mastra.getWorkflow("birthday-notification-workflow");
    
    if (!workflow) {
      console.error("❌ Workflow not found!");
      return;
    }
    
    console.log("✅ Workflow found, creating run...");
    const run = await workflow.createRunAsync();
    
    console.log("▶️ Starting workflow...");
    const result = await run.start({ inputData: {} });
    
    console.log("✅ Workflow completed!");
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testBirthdayWorkflow();
