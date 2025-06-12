import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "./client.js";

/**
 * Base helper function to register an MCP tool for DataForSEO API
 */
export function registerTool(
  server: McpServer,
  name: string,
  schema: any,
  handler: (params: any, client: DataForSeoClient) => Promise<any>
) {
  // The latest MCP SDK accepts either a Zod schema or a raw shape object as the
  // second argument. We simply forward whatever we receive.  At runtime, many
  // handlers simply use the `DataForSeoClient` instance that is closed over
  // when `registerTool` is invoked, so we treat the `client` argument as
  // optional and do not rely on the extra context object provided by the SDK.

  server.tool(name, schema as any, async (params, _context: any) => {
    try {
      // Attempt to obtain the DataForSeoClient from the SDK context.  If the
      // SDK no longer attaches custom values to the context object, fall back
      // to the global reference we create in `src/index.ts`.
      const clientInstance =
        (_context && (_context as any).client) ||
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (globalThis.__dataForSeoClient as DataForSeoClient);

      const result = await handler(params, clientInstance);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`Error in ${name} tool:`, error);

      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: error.message,
                  stack: error.stack,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Unknown error occurred",
                details: error,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  });
}

/**
 * Helper for registering a task-based tool (POST, READY, GET pattern)
 */
export function registerTaskTool(
  server: McpServer,
  baseName: string,
  postSchema: any,
  postHandler: (params: any, client: DataForSeoClient) => Promise<any>,
  readyHandler: (client: DataForSeoClient) => Promise<any>,
  getHandler: (id: string, client: DataForSeoClient) => Promise<any>
) {
  // Register POST tool
  registerTool(server, `${baseName}_post`, postSchema as any, postHandler);

  // Register READY tool
  registerTool(server, `${baseName}_ready`, {} as any, (_params, client) =>
    readyHandler(client)
  );

  // Register GET tool
  registerTool(
    server,
    `${baseName}_get`,
    { id: z.string() } as any,
    (params, client) => getHandler(params.id, client)
  );
}
