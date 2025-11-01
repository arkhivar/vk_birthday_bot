import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const vkTool = createTool({
  id: "post-to-vk-wall",
  description: "Posts a message to a VK group wall using the VK API",
  
  inputSchema: z.object({
    message: z.string().describe("Message to post to the VK group wall"),
    ownerId: z.number().describe("VK group ID (should be negative, e.g., -227823182)"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    postId: z.number().optional(),
    error: z.string().optional(),
    vkResponse: z.any().optional(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [VKTool] Starting execution', { 
      ownerId: context.ownerId,
      messageLength: context.message.length 
    });
    
    const accessToken = process.env.VK_ACCESS_TOKEN;
    
    if (!accessToken) {
      logger?.error('❌ [VKTool] VK_ACCESS_TOKEN not found');
      return {
        success: false,
        error: "VK_ACCESS_TOKEN environment variable is not set",
      };
    }
    
    try {
      logger?.info('📝 [VKTool] Posting to VK group wall...');
      
      const params = new URLSearchParams({
        message: context.message,
        owner_id: context.ownerId.toString(),
        from_group: '1',
        access_token: accessToken,
        v: '5.131',
      });
      
      const response = await fetch('https://api.vk.com/method/wall.post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger?.error('❌ [VKTool] VK API HTTP error', { 
          status: response.status, 
          error: errorText 
        });
        return {
          success: false,
          error: `VK API HTTP error: ${response.status} - ${errorText}`,
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        logger?.error('❌ [VKTool] VK API returned error', { 
          errorCode: data.error.error_code,
          errorMsg: data.error.error_msg 
        });
        return {
          success: false,
          error: `VK API error ${data.error.error_code}: ${data.error.error_msg}`,
          vkResponse: data,
        };
      }
      
      logger?.info('✅ [VKTool] Successfully posted to VK', { 
        postId: data.response?.post_id 
      });
      
      return {
        success: true,
        postId: data.response?.post_id,
        vkResponse: data,
      };
    } catch (error) {
      logger?.error('❌ [VKTool] Unexpected error', { error });
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
