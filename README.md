# Coree opencode Integration

[Coree](https://github.com/coree-ai/coree) provides persistent memory and code intelligence for AI agents. This repository contains the MCP server configuration and context file for integrating Coree into [opencode](https://opencode.ai).

## Features

- **Persistent Memory**: Stores decisions, architectural discoveries, and gotchas across sessions.
- **Code Intelligence**: Hybrid search over source code and git history.

## Installation

opencode does not yet support a distributable MCP plugin format. Installation
requires two manual steps.

### 1. Add the MCP server to opencode.json

Edit `~/.config/opencode/opencode.json` (global) or `opencode.json` in your
project root (project-scoped), and add:

```json
{
  "mcp": {
    "coree": {
      "type": "local",
      "command": ["npx", "--yes", "@coree-ai/coree@0.14.0", "serve"],
      "environment": {
        "COREE__MEMORY__REMOTE_AUTH_TOKEN": "{env:COREE__MEMORY__REMOTE_AUTH_TOKEN}",
        "COREE__MEMORY__REMOTE_URL": "{env:COREE__MEMORY__REMOTE_URL}",
        "COREE__INDEX__REMOTE_AUTH_TOKEN": "{env:COREE__INDEX__REMOTE_AUTH_TOKEN}",
        "COREE__INDEX__REMOTE_URL": "{env:COREE__INDEX__REMOTE_URL}",
        "COREE_BINARY_OVERRIDE": "{env:COREE_BINARY_OVERRIDE}",
        "COREE_MODEL_DIR": "{env:COREE_MODEL_DIR}"
      },
      "enabled": true,
      "timeout": 120000
    }
  }
}
```

The `{env:VAR}` syntax forwards the named variable from your shell environment.
Variables not set in your environment are passed as empty strings and coree
will ignore them.

### 2. Add the context file to your project

Copy `opencode.md` from this repository into your project root:

```bash
curl -fsSL https://raw.githubusercontent.com/coree-ai/opencode/main/opencode.md \
  -o opencode.md
```

opencode loads `opencode.md` from the project root as agent instructions. This
tells the agent when and how to use the coree tools.

Alternatively, add it globally:

```bash
curl -fsSL https://raw.githubusercontent.com/coree-ai/opencode/main/opencode.md \
  -o ~/.config/opencode/AGENTS.md
```

## Verify

After configuration, start an opencode session and run:

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
