{
"mcpServers": {
"github.com/upstash/context7-mcp": {
"command": "npx",
"args": [
"-y",
"@upstash/context7-mcp",
"--api-key",
"ctx7sk-67ba73d1-a752-4bc9-8919-5ef93351f34f"
],
"disabled": false,
"autoApprove": [
"resolve-library-id",
"query-docs"
]
},
"github.com/microsoft/playwright-mcp": {
"type": "stdio",
"command": "npx",
"timeout": 30,
"args": [
"-y",
"@playwright/mcp@latest"
],
"disabled": false,
"autoApprove": [
"browser_evaluate",
"browser_close",
"browser_resize"
]
},
"github.com/executeautomation/mcp-playwright": {
"command": "npx",
"args": [
"-y",
"@executeautomation/playwright-mcp-server"
],
"disabled": false,
"autoApprove": [
"browser_install"
]
},
"github.com/modelcontextprotocol/servers/tree/main/src/filesystem": {
"command": "npx",
"args": [
"-y",
"@modelcontextprotocol/server-filesystem",
"c:\\CODE\\Qwen cli Life os\\life-os"
],
"disabled": false,
"autoApprove": []
},
"github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking": {
"command": "npx",
"args": [
"-y",
"@modelcontextprotocol/server-sequential-thinking"
],
"disabled": false,
"autoApprove": [
"sequentialthinking"
]
},
"github.com/zcaceres/fetch-mcp": {
"command": "npx",
"args": [
"-y",
"mcp-fetch-server"
],
"env": {
"DEFAULT_LIMIT": "50000"
},
"disabled": false,
"autoApprove": []
}
}
}
