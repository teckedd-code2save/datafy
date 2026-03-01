# Datafy

> [!NOTE]  
> Datafy is deeply rooted in and built upon [DBHub](https://github.com/bytebase/dbhub). Their documentation and implementation remain a highly relevant foundation.



## Database MCP Gateway Architecture

```text
  ____        _         __       
 |  _ \  __ _| |_ __ _ / _|_   _ 
 | | | |/ _` | __/ _` | |_| | | |
 | |_| | (_| | || (_| |  _| |_| |
 |____/ \__,_|\__\__,_|_|  \__, |
                           |___/ 
```

```bash
            +------------------+    +--------------+    +------------------+
            |                  |    |              |    |                  |
            |                  |    |              |    |                  |
            |  Claude Desktop  +--->+              +--->+    PostgreSQL    |
            |                  |    |              |    |                  |
            |  Claude Code     +--->+              +--->+    SQL Server    |
            |                  |    |              |    |                  |
            |  Cursor          +--->+    Datafy    +--->+    SQLite        |
            |                  |    |              |    |                  |
            |  VS Code         +--->+              +--->+    MySQL/MariaDB |
            |                  |    |              |    |                  |
            |  Copilot CLI     +--->+              +--->+    Redis         |
            |                  |    |              |    |                  |
            |                  |    |              +--->+    Elasticsearch |
            |                  |    |              |    |                  |
            +------------------+    +--------------+    +------------------+
                 MCP Clients           MCP Server             Databases
```

Datafy is a zero-dependency, token efficient MCP server implementing the Model Context Protocol (MCP) server interface. This lightweight gateway allows MCP-compatible clients to connect to and explore different databases:

- **Local Development First**: Zero dependency, token efficient with just two MCP tools to maximize context window
- **Multi-Database**: PostgreSQL, MySQL, MariaDB, SQL Server, SQLite, Redis, and Elasticsearch through a single interface
- **Multi-Connection**: Connect to multiple databases simultaneously with TOML configuration
- **Guardrails**: Read-only mode, row limiting, and query timeout to prevent runaway operations
- **Secure Access**: SSH tunneling and SSL/TLS encryption

## Supported Databases

PostgreSQL, MySQL, SQL Server, MariaDB, SQLite, Redis, and Elasticsearch.

## MCP Tools

Datafy implements MCP tools for database operations:

- **[execute_sql](https://dbhub.ai/tools/execute-sql)**: Execute SQL queries with transaction support and safety controls
- **[search_objects](https://dbhub.ai/tools/search-objects)**: Search and explore database schemas, tables, columns, indexes, and procedures with progressive disclosure
- **[redis_command](https://redis.io/commands/)**: Execute Redis commands (e.g., GET, SET, HGETALL) directly
- **[elasticsearch_search](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-your-data.html)**: Execute Elasticsearch queries using JSON DSL or simplified syntax
- **[Custom Tools](https://dbhub.ai/tools/custom-tools)**: Define reusable, parameterized SQL operations in your `dbhub.toml` configuration file



## Installation

See the full [Installation Guide](https://dbhub.ai/installation) for detailed instructions.

### Quick Start

**Docker:**

```bash
docker run --rm --init \
   --name datafy \
   --publish 8080:8080 \
   teckedd-code2save/datafy \
   --transport http \
   --port 8080 \
   --dsn "postgres://user:password@localhost:5432/dbname?sslmode=disable"
```

**NPM:**

```bash
npx @teckedd-code2save/datafy@latest --transport http --port 8080 --dsn "postgres://user:password@localhost:5432/dbname?sslmode=disable"
```

**Demo Mode:**

```bash
npx @teckedd-code2save/datafy@latest --transport http --port 8080 --demo
```

See [Command-Line Options](https://dbhub.ai/config/command-line) for all available parameters.

### Multi-Database Setup

Connect to multiple databases simultaneously using TOML configuration files. Perfect for managing production, staging, and development databases from a single Datafy instance.

See [Multi-Database Configuration](https://dbhub.ai/config/toml) for complete setup instructions.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build and run for production
pnpm build && pnpm start --transport stdio --dsn "postgres://user:password@localhost:5432/dbname"
```

See [Testing](.claude/skills/testing/SKILL.md) and [Debug](https://dbhub.ai/config/debug).

