import type { Plugin } from "@opencode-ai/plugin";

const COREE_VERSION = "0.15.0";

const coreeArgs = ["--yes", `@coree-ai/coree@${COREE_VERSION}`];

export const CoreePlugin: Plugin = async ({ $ }) => {
	// Tracks which sessions have already had session-boundary context injected,
	// so the full memory/captures payload is injected once per session (on the
	// first user message) rather than on every turn.
	const seededSessions = new Set<string>();

	// Run `coree inject` and return its stdout. coree writes all injectable
	// context to stdout; errors are swallowed so a memory hiccup never blocks a
	// turn. Array interpolation lets Bun's shell escape every argument, so the
	// user's prompt is passed safely with no shell-injection risk.
	const inject = async (...args: string[]): Promise<string> => {
		try {
			return (await $`npx ${coreeArgs} inject ${args}`.nothrow().text()).trim();
		} catch {
			return "";
		}
	};

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
						COREE__MEMORY__REMOTE_AUTH_TOKEN:
							process.env.COREE__MEMORY__REMOTE_AUTH_TOKEN,
					}),
					...(process.env.COREE__MEMORY__REMOTE_URL && {
						COREE__MEMORY__REMOTE_URL: process.env.COREE__MEMORY__REMOTE_URL,
					}),
					...(process.env.COREE__INDEX__REMOTE_AUTH_TOKEN && {
						COREE__INDEX__REMOTE_AUTH_TOKEN:
							process.env.COREE__INDEX__REMOTE_AUTH_TOKEN,
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

		// Fires on every user message. opencode consumes `output.parts` by
		// reference to build the message sent to the model, so pushing a synthetic
		// text part injects coree context directly into the turn - the equivalent
		// of Claude Code's SessionStart + UserPromptSubmit hooks.
		"chat.message": async (_input, output) => {
			const sessionID = output.message.sessionID;
			const chunks: string[] = [];

			// First message of the session: inject session-boundary context (pending
			// captures + relevant memories). Whatever coree prints is delivered
			// verbatim - if it is still loading its embedding model (cold start), the
			// injected "starting up" notice tells the agent to call session_context
			// once ready (the documented agent-pull fallback). The plugin never
			// inspects coree's output; coree owns what gets said.
			if (!seededSessions.has(sessionID)) {
				seededSessions.add(sessionID);
				const session = await inject("--type", "session");
				if (session) chunks.push(session);
			}

			// Every message: live memory + code suggestions for this prompt.
			const prompt = output.parts
				.filter((p) => p.type === "text" && !p.synthetic && !p.ignored)
				.map((p) => (p as { text: string }).text)
				.join("\n")
				.trim();
			if (prompt) {
				const suggestions = await inject("--type", "prompt", "--query", prompt);
				if (suggestions) chunks.push(suggestions);
			}

			if (chunks.length === 0) return;

			output.parts.push({
				id: `prt_coree_${Date.now().toString(36)}`,
				sessionID,
				messageID: output.message.id,
				type: "text",
				synthetic: true,
				text: chunks.join("\n\n"),
			});
		},

		event: async ({ event }) => {
			// After compaction the model loses the prior memory context, so re-seed
			// it: dropping the session id makes the next message re-inject session
			// context (the post-compaction auto-continue message triggers it).
			if (event.type === "session.compacted") {
				seededSessions.delete(event.properties.sessionID);
			} else if (event.type === "session.deleted") {
				seededSessions.delete(event.properties.info.id);
			}
		},
	};
};

export default CoreePlugin;
