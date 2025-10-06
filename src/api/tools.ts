import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "./client.js";

/**
 * Base helper function to register an MCP tool for DataForSEO API
 */
export function registerTool<T extends z.ZodRawShape>(
  server: McpServer,
  name: string,
  schema: z.ZodObject<T> | T,
  handler: (params: z.infer<z.ZodObject<T>>, client: DataForSeoClient) => Promise<any>,
  client: DataForSeoClient
) {
  // Extract the shape from ZodObject if needed
  const shape = schema instanceof z.ZodObject ? schema.shape : schema;

  (server.tool as any)(
    name,
    shape,
    async (params: any, _context: any) => {
      try {
        // We get the apiClient from the closure
        const result = await handler(params as z.infer<z.ZodObject<T>>, client);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error(`Error in ${name} tool:`, error);

        if (error instanceof Error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: error.message,
                  stack: error.stack
                }, null, 2)
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Unknown error occurred",
                details: error
              }, null, 2)
            }
          ]
        };
      }
    }
  );
}

/**
 * Helper for registering a task-based tool (POST, READY, GET pattern)
 */
export function registerTaskTool<PostT extends z.ZodRawShape>(
  server: McpServer,
  baseName: string,
  postSchema: z.ZodObject<PostT> | PostT,
  postHandler: (params: z.infer<z.ZodObject<PostT>>, client: DataForSeoClient) => Promise<any>,
  readyHandler: (client: DataForSeoClient) => Promise<any>,
  getHandler: (id: string, client: DataForSeoClient) => Promise<any>,
  client: DataForSeoClient
) {
  // Register POST tool
  registerTool(
    server,
    `${baseName}_post`,
    postSchema,
    postHandler,
    client
  );

  // Register READY tool
  registerTool(
    server,
    `${baseName}_ready`,
    {},
    (_params, client) => readyHandler(client),
    client
  );

  // Register GET tool
  registerTool(
    server,
    `${baseName}_get`,
    { id: z.string() },
    (params, client) => getHandler(params.id, client),
    client
  );
}