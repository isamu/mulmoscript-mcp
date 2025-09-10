#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, CallToolRequest, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import os from "os";
import path from "path";

import { MulmoScriotGenerator } from "./mulmo_script_generator";
import { generatorTools } from "./tools";
import { toolsForBeat } from "./tools2";
import { OpenAITool } from "./type";

export const openAIToolsToAnthropicTools = (tools: OpenAITool[]) => {
  return {
    tools: tools.map((tool) => {
      const { name, description, parameters } = tool.function;
      return { name, description, inputSchema: parameters };
    }),
  };
};

export const getServer = () => {
  const documentsDir = path.join(os.homedir(), "Documents");
  const now = Date.now();

  const outputDir = path.join(documentsDir, "mulmocast-vision", String(now));

  const generator = new MulmoScriotGenerator({ outputDir });

  const server = new Server(
    {
      name: "mcp-web-crawler",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return openAIToolsToAnthropicTools([...generatorTools, ...toolsForBeat]);
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    try {
      console.error(name, JSON.stringify(args));
      if (name in generator && args) {
        const key = name as keyof typeof generator;
        const method = generator[key];
        if (typeof method === "function") {
          const ret = await method(args as any);
          return {
            content: [
              {
                type: "text",
                text: ret?.text,
              },
            ],
          };
        }
      }
      await generator.callNamedFunction(name, args as any);
      return {
        content: [
          {
            type: "text",
            text: `hello ${name} ${JSON.stringify(args)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });
  return server;
};

async function main() {
  const server = getServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-web-crawler MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
