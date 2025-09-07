#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, CallToolRequest, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { MulmoScriotGenerator } from "./mulmo_script_generator";


export const tools = [
  {
    type: "function",
    function: {
      name: "dumpScript",
      description: "Dump current mulmoscript json data.",
      parameters: {
        type: "object",
        properties: {
          mode: { type: "string", description: "mode" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addBeatToMulmoScript",
      description: "add beat to mulmo script.",
      parameters: {
        type: "object",
        beat: {
          type: "object",
          properties: {
            text: { type: "string", description: "talk script for each beat" },
            speaker: { type: "string", description: "speaker" },
          },
          required: ["text"],
        },
        required: ["beat"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateBeatOnMulmoScript",
      description: "update beat on mulmo script.",
      parameters: {
        type: "object",
        properties: {
          index: { type: "number", description: "index of beats array" },
          beat: {
            type: "object",
            properties: {
              text: { type: "string", description: "talk script for each beat" },
              speaker: { type: "string", description: "speaker" },
            },
            required: ["text"],
          },
        },
        required: ["beat", "index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "setImagePromptOnBeat",
      description: "update beat on mulmo script.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "talk script for each beat" },
          speaker: { type: "string", description: "speaker" },
        },
        required: ["text"],
      },
    },
  },
]

export const openAIToolsToAnthropicTools = (tools: any[]) => {
  return {
    tools: tools.map((tool) => {
      const { name, description, parameters } = tool.function;
      return { name, description, inputSchema: parameters };
    }),
  };
};

export const getServer = () => {
  const generator = new MulmoScriotGenerator({ outputDir: "123"});

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
    return openAIToolsToAnthropicTools(tools);
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    try {
      if (name in generator && args) {
        const key = name as keyof typeof generator;
        const method = generator[key];
        if (typeof method === "function") {
          const ret = await method(args as any);
          return {
            content: [
              {
                type: "text",
                text: ret.text,
              },
            ],
          };
          
        }
      }
      return {
        content: [
          {
            type: "text",
            text: "hello",
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
