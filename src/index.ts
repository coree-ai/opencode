import type { Plugin } from "@opencode-ai/plugin";

const COREE_VERSION = "0.14.0";

const coreeArgs = [
  "--yes",
  `@coree-ai/coree@${COREE_VERSION}`,
];

export const CoreePlugin: Plugin = async ({ $ }) => {
  return {
    async config(cfg) {
      cfg.mcp = cfg.mcp ?? {};
      cfg.mcp["coree"] = {
        type: "local",
        command: ["npx", ...coreeArgs, "serve"],
        enabled: true,
        timeout: 120000,
        environment: {
          ...(process.env.COREE__MEMORY__REMOTE_AUTH_TOKEN && {
            COREE__MEMORY__REMOTE_AUTH_TOKEN: process.env.COREE__MEMORY__REMOTE_AUTH_TOKEN,
          }),
          ...(process.env.COREE__MEMORY__REMOTE_URL && {
            COREE__MEMORY__REMOTE_URL: process.env.COREE__MEMORY__REMOTE_URL,
          }),
          ...(process.env.COREE__INDEX__REMOTE_AUTH_TOKEN && {
            COREE__INDEX__REMOTE_AUTH_TOKEN: process.env.COREE__INDEX__REMOTE_AUTH_TOKEN,
          }),
          ...(process.env.COREE__INDEX__REMOTE_URL && {
            COREE__INDEX__REMOTE_URL: process.env.COREE__INDEX__REMOTE_URL,
          }),
          ...(process.env.COREE_BINARY_OVERRIDE && {
            COREE_BINARY_OVERRIDE: process.env.COREE_BINARY_OVERRIDE,
          }),
          ...(process.env.COREE_MODEL_DIR && {
            COREE_MODEL_DIR: process.env.COREE_MODEL_DIR,
          }),
        },
      };
    },

    event: async ({ event }) => {
      const inject = async (...args: string[]) => {
        await $(["npx", ...coreeArgs, "inject", ...args]).nothrow().quiet();
      };

      if (event.type === "session.created") {
        await inject("--type", "session");
      } else if (event.type === "session.idle") {
        await inject("--type", "stop");
      } else if (event.type === "session.compacted") {
        await inject("--type", "compact");
      }
    },
  };
};

export default CoreePlugin;