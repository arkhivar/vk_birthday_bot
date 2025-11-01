import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const gristTool = createTool({
  id: "fetch-grist-birthdays",
  description: "Fetches birthday data from a Grist document table",
  
  inputSchema: z.object({
    docId: z.string().describe("Grist document ID"),
    tableId: z.string().describe("Grist table ID"),
  }),
  
  outputSchema: z.object({
    records: z.array(z.object({
      id: z.number(),
      fields: z.record(z.any()),
    })),
    success: z.boolean(),
    error: z.string().optional(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [GristTool] Starting execution', { 
      docId: context.docId, 
      tableId: context.tableId 
    });
    
    const apiKey = process.env.GRIST_API_KEY;
    
    if (!apiKey) {
      logger?.error('❌ [GristTool] GRIST_API_KEY not found');
      return {
        records: [],
        success: false,
        error: "GRIST_API_KEY environment variable is not set",
      };
    }
    
    try {
      logger?.info('📝 [GristTool] Fetching data from Grist API...');
      
      const url = `https://docs.getgrist.com/api/docs/${context.docId}/tables/${context.tableId}/records`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger?.error('❌ [GristTool] Grist API error', { 
          status: response.status, 
          error: errorText 
        });
        return {
          records: [],
          success: false,
          error: `Grist API error: ${response.status} - ${errorText}`,
        };
      }
      
      const data = await response.json();
      logger?.info('✅ [GristTool] Successfully fetched data', { 
        recordCount: data.records?.length || 0 
      });
      
      return {
        records: data.records || [],
        success: true,
      };
    } catch (error) {
      logger?.error('❌ [GristTool] Unexpected error', { error });
      return {
        records: [],
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
