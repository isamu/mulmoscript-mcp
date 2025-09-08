export const generatorTools = [
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
  {
    type: "function",
    function: {
      name: "setDirectory",
      description:
        "Specify a directory for each session and output the mulmo script to that directory. Call it once before creating a mulmo scripte, and again when creating the next new  mulmo script.",
      parameters: {
        type: "object",
        properties: {
          directoryName: { type: "string", description: "Directory name" },
        },
        required: ["directoryName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "saveMulmoScript",
      description:
        "save mulmo script.",
      parameters: {
        type: "object",
        properties: {
          directoryName: { type: "string", description: "Directory name" },
        },
        required: ["directoryName"],
      },
    },
  },

];
