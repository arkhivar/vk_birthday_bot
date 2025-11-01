import { mastra } from "./src/mastra";

async function testBirthdayWorkflow() {
  console.log("Testing birthday workflow...");
  
  try {
    const workflow = mastra.getWorkflow("birthdayWorkflow");
    
    if (!workflow) {
      console.error("Workflow not found!");
      return;
    }
    
    console.log("Workflow found, creating run...");
    const run = await workflow.createRunAsync();
    
    console.log("Starting workflow execution...");
    const result = await run.start({ inputData: {} });
    
    console.log("Workflow result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error testing workflow:", error);
  }
}

testBirthdayWorkflow();
