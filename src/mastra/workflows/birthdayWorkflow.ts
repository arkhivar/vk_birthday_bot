import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { birthdayAgent } from "../agents/birthdayAgent";

const birthdayResultSchema = z.object({
  success: z.boolean().describe("Whether the operation completed successfully"),
  birthdaysFound: z.boolean().describe("Whether any birthdays were found today"),
  birthdayCount: z.number().describe("Number of birthdays found"),
  message: z.string().describe("Human-readable status message"),
  error: z.string().optional().describe("Error message if operation failed"),
  postedToVK: z.boolean().describe("Whether the message was successfully posted to VK"),
});

const checkAndPostBirthdays = createStep({
  id: "check-and-post-birthdays",
  description: "Check for today's birthdays in Grist and post to VK if any exist",
  
  inputSchema: z.object({}),
  
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    birthdaysFound: z.boolean(),
    postedToVK: z.boolean(),
  }),
  
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🎂 [BirthdayWorkflow] Starting birthday check...');
    
    const gristDocId = "4w9eBjjxRqUh";
    const gristTableId = "Folks";
    
    const prompt = `
      Check for birthdays today and post to VK if any exist. Return a structured JSON response.
      
      Steps:
      1. Use the fetch-grist-birthdays tool with docId "${gristDocId}" and tableId "${gristTableId}"
      2. If the Grist fetch fails, return immediately with success: false and the error details
      3. Look through all the records and find anyone whose 'DoB' field matches today's month and day (ignore the year)
      4. For each person with a birthday today, calculate their age
      5. If there are birthdays:
         - Format a message in Russian like this:
           "🎂 Дни рождения сегодня:
           [Name] ([Age])
           [Name] ([Age])"
         - Post it to VK using the post-to-vk-wall tool with ownerId -227823182
         - Set postedToVK based on whether the VK post succeeded
      6. If there are NO birthdays today, set birthdaysFound: false and postedToVK: false
      
      Today's date is: ${new Date().toISOString().split('T')[0]}
      
      You MUST return your response in this exact JSON format:
      {
        "success": true/false,
        "birthdaysFound": true/false,
        "birthdayCount": number,
        "message": "status message",
        "error": "error details if any",
        "postedToVK": true/false
      }
    `;
    
    try {
      logger?.info('📝 [BirthdayWorkflow] Calling birthday agent with tools enabled...');
      
      const response = await birthdayAgent.generateLegacy(
        [{ role: "user", content: prompt }],
        { 
          mastra,
          maxSteps: 5,
        }
      );
      
      logger?.info('✅ [BirthdayWorkflow] Agent completed', { text: response.text });
      
      // Parse JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*"success"[\s\S]*\}/);
      if (!jsonMatch) {
        logger?.warn('⚠️ [BirthdayWorkflow] Could not parse JSON from response');
        return {
          success: false,
          message: "Could not parse response",
          birthdaysFound: false,
          postedToVK: false,
        };
      }
      
      const result = JSON.parse(jsonMatch[0]);
      logger?.info('📊 [BirthdayWorkflow] Parsed result', { result });
      
      return {
        success: result.success || false,
        message: result.message || "No message",
        birthdaysFound: result.birthdaysFound || false,
        postedToVK: result.postedToVK || false,
      };
    } catch (error) {
      logger?.error('❌ [BirthdayWorkflow] Error occurred', { error });
      return {
        success: false,
        message: `Workflow error: ${error instanceof Error ? error.message : String(error)}`,
        birthdaysFound: false,
        postedToVK: false,
      };
    }
  },
});

export const birthdayWorkflow = createWorkflow({
  id: "birthday-notification-workflow",
  inputSchema: z.object({}),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    birthdaysFound: z.boolean(),
    postedToVK: z.boolean(),
  }),
})
  .then(checkAndPostBirthdays)
  .commit();
