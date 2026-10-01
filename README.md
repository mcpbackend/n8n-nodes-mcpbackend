# MCPBackend for n8n

Build workflows with the [MCPBackend](https://mcpbackend.com) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-mcpbackend` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **MCPBackend OAuth2 API** credential, select **Connect my account**, sign in to MCPBackend, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://mcp.mcpbackend.com/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x:** reconnect the credential before running workflows. Version 2 replaces the old MCP transport with the native REST API. Inputs retain their names, while outputs are the API's resource JSON. Review existing workflows before enabling writes.

## Operations

| Operation | HTTP request |
| --- | --- |
| add_column | `POST /v1/projects/:projectId/tables/:table/columns` |
| add_team_member | `POST /v1/team` |
| create_api_key | `POST /v1/projects/:projectId/keys` |
| create_project | `POST /v1/projects` |
| create_table | `POST /v1/projects/:projectId/tables` |
| create_webhook | `POST /v1/projects/:projectId/webhooks` |
| get_project | `GET /v1/projects/:projectId` |
| get_project_api | `GET /v1/projects/:projectId/openapi.json` |
| get_schema | `GET /v1/projects/:projectId/schema` |
| get_usage | `GET /v1/projects/:projectId/usage` |
| list_projects | `GET /v1/projects` |
| list_team_members | `GET /v1/team` |
| remove_team_member | `DELETE /v1/team/:memberId` |
| set_auth_enabled | `PUT /v1/projects/:projectId/auth` |
| set_table_rls | `PUT /v1/projects/:projectId/tables/:table/rls` |
| update_team_member | `PATCH /v1/team/:memberId` |

## Signed webhook trigger

The **MCPBackend Trigger** registers an event subscription when a workflow activates, checks the stored subscription on subsequent activations, and removes only that subscription when the workflow deactivates. It verifies the provider's HMAC signature against the original request body, checks event freshness and resource ownership, and rejects unsigned or altered payloads. Signing secrets stay in the node's workflow state and are never emitted as event data.

Use a public HTTPS n8n webhook URL. Select an owned project and its event types. Product plan and role requirements still apply. Testing a trigger temporarily registers its test URL; cleanup removes that subscription when n8n stops listening.

## Workflow behavior

Each input item makes one API request and produces one linked output item. Optional pagination fields can be passed through the node's options; list responses retain their next-page cursor or offset. Write operations require the node's explicit confirmation switch. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors are summarized without including credentials or raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [mcpbackend/n8n-nodes-mcpbackend](https://github.com/mcpbackend/n8n-nodes-mcpbackend). Report node issues in [GitHub Issues](https://github.com/mcpbackend/n8n-nodes-mcpbackend/issues).

Product: [MCPBackend](https://mcpbackend.com) · [Privacy](https://mcpbackend.com/privacy/) · [Agent skill](https://github.com/mcpbackend/agent-skill) · [MCP integration](https://github.com/mcpbackend/mcp-server)

MIT license.
