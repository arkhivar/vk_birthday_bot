import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { gristTool } from "../tools/gristTool";
import { vkTool } from "../tools/vkTool";

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
    
    try {
      // Step 1: Fetch data from Grist
      logger?.info('📥 [BirthdayWorkflow] Fetching data from Grist...');
      const gristResult = await gristTool.execute({
        context: { docId: gristDocId, tableId: gristTableId },
        mastra,
      } as any);
      
      if (!gristResult.success) {
        logger?.error('❌ [BirthdayWorkflow] Grist fetch failed', { error: gristResult.error });
        return {
          success: false,
          message: `Failed to fetch from Grist: ${gristResult.error}`,
          birthdaysFound: false,
          postedToVK: false,
        };
      }
      
      logger?.info('✅ [BirthdayWorkflow] Fetched records', { count: gristResult.records.length });
      
      // Step 2: Find birthdays matching today's month and day
      const today = new Date();
      const todayMonth = today.getUTCMonth() + 1; // 1-12
      const todayDay = today.getUTCDate(); // 1-31
      
      const birthdayPeople: Array<{ name: string; age: number }> = [];
      
      for (const record of gristResult.records) {
        const dob = record.fields.DoB;
        const name = record.fields.name;
        
        if (!dob || !name) continue;
        
        // Convert Unix timestamp to date
        const birthDate = new Date(dob * 1000);
        const birthMonth = birthDate.getUTCMonth() + 1;
        const birthDay = birthDate.getUTCDate();
        
        // Check if month and day match
        if (birthMonth === todayMonth && birthDay === todayDay) {
          const birthYear = birthDate.getUTCFullYear();
          const age = today.getUTCFullYear() - birthYear;
          birthdayPeople.push({ name, age });
          logger?.info('🎂 [BirthdayWorkflow] Found birthday!', { name, age });
        }
      }
      
      // Step 3: If no birthdays, return
      if (birthdayPeople.length === 0) {
        logger?.info('ℹ️ [BirthdayWorkflow] No birthdays today');
        return {
          success: true,
          message: "No birthdays found for today.",
          birthdaysFound: false,
          postedToVK: false,
        };
      }
      
      // Step 4: Format message and post to VK directly
      const message = `🎂 Дни рождения сегодня:\n${birthdayPeople.map(p => `${p.name} (${p.age})`).join('\n')}`;
      
      logger?.info('📤 [BirthdayWorkflow] Posting to VK...', { message });
      
      const vkResult = await vkTool.execute({
        context: { 
          message,
          ownerId: -227823182 
        },
        mastra,
      } as any);
      
      if (!vkResult.success) {
        logger?.error('❌ [BirthdayWorkflow] VK post failed', { error: vkResult.error });
        return {
          success: true,
          message: `Found ${birthdayPeople.length} birthday(s) but failed to post to VK: ${vkResult.error}`,
          birthdaysFound: true,
          postedToVK: false,
        };
      }
      
      logger?.info('✅ [BirthdayWorkflow] Successfully posted to VK', { postId: vkResult.postId });
      
      return {
        success: true,
        message: `Found ${birthdayPeople.length} birthday(s) and successfully posted to VK`,
        birthdaysFound: true,
        postedToVK: true,
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
