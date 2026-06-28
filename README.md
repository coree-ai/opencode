# Coree opencode Plugin

[Coree](https://github.com/coree-ai/coree) provides persistent memory and code intelligence for AI agents.
This plugin registers the coree MCP server and handles lifecycle events in opencode.

## Features

- **MCP Server**: Automatically registers the coree MCP server in opencode.
- **Automatic context injection**: Injects relevant memories on session start and
  live memory/code suggestions on every prompt, via opencode's `chat.message` hook.
- **Compaction-aware**: Re-injects session context after the conversation is compacted.
- **Agent Instructions**: `opencode.md` tells the agent when and how to use coree's tools.

## Installation

Add the plugin to your `opencode.json`:

```json
{
  "plugin": ["@coree-ai/opencode"]
}
```

### Agent instructions (optional)

Add `opencode.md` to your project root (or copy to `~/.config/opencode/AGENTS.md`):

```bash
curl -fsSL https://raw.githubusercontent.com/coree-ai/opencode/main/opencode.md \
  -o opencode.md
```

## Verify

Start an opencode session and run:

```
call the diagnose tool
```

The `diagnose` MCP tool reports server state, database status, and any
initialisation errors.

## Usage

Once configured, Coree provides MCP tools. Ask opencode to search your codebase
or memories:

```
search for how the indexing works
```

See [opencode.md](./opencode.md) for detailed usage guidelines.

<!-- coree version: @coree-ai/coree@0.16.0 -->
