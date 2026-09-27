# n8n-nodes-mcpbackend

Connect [**MCPBackend**](https://mcpbackend.com) to n8n workflows using your own account. This package exposes 16 named operations through the product's authenticated API, with form fields for required inputs and optional fields you choose explicitly.

## Installation

For self-hosted n8n, open **Settings → Community Nodes → Install** and enter `n8n-nodes-mcpbackend`. On n8n Cloud, installation depends on n8n's community-node verification; npm publication alone does not make a node verified.

Use n8n **2.40.7 or newer**, with OAuth dynamic client registration support. Older installations should upgrade before using this credential.

## Authentication

1. Add the **MCPBackend** node and create a **MCPBackend OAuth2 API** credential.
2. Click **Connect my account**. n8n discovers the product authorization server and registers its own callback automatically.
3. Sign in to your MCPBackend account, check the account and permissions on the consent screen, and approve the connection.
4. Save the credential and select an operation.

No API key, client secret, browser cookie, or access token belongs in a workflow field. n8n stores the OAuth credential and refreshes tokens. Your account roles, ownership checks, available integrations, plan limits and credits still apply. You can revoke the connection in the product's connected-app settings. This node contacts only `https://mcp.mcpbackend.com/mcp`; the n8n OAuth flow contacts the product's discovered authorization server.

## Operations

| Operation | Access | Purpose |
| --- | --- | --- |
| Add Column | Write / may use credits | Add a column to an existing table. NOT NULL columns require a defaultValue. |
| Add Team Member | Write / may use credits | Add a team member by email with full access or access to selected projects. Sends an invitation email. |
| Create API Key | Write / may use credits | Create a server-side API key for a project's data API. Empty permissions = full access; otherwise per-table {table, read, create, update, delete}. Returns the secret once. The secret grants server-side access and is unsuitable for public client code. |
| Create Project | Write / may use credits | Create a new project. Provisions a dedicated database and returns the project id plus canonical application API URLs. |
| Create Table | Write / may use credits | Create a table in a project's database. An integer primary key `id` is added automatically unless you define your own primary key or an `id` column. |
| Create Webhook | Write / may use credits | Create a webhook that POSTs on row changes. events like ['posts.created','*.deleted','*']. Returns the signing secret once. |
| Get Project | Read | Get an existing project by id, including its canonical data-plane API URLs. |
| Get Project API | Read | Get the exact runtime API contract for an existing or newly created project. Returns canonical route templates, security guidance, and the generated OpenAPI document. |
| Get Schema | Read | Get the tables/columns schema of a project. This describes the storage schema. |
| Get Usage | Read | Get the current-month usage and plan limits for a project. |
| List Projects | Read | List the caller's McpBackend projects. Each project includes canonical data-plane API URLs. |
| List Team Members | Read | List team members, their access scope, and projects owned by the caller for assignment. |
| Remove Team Member | Write / may use credits | Remove a member from the caller's team and revoke all shared project access. |
| Set Auth Enabled | Write / may use credits | Enable or disable end-user (email/password) authentication for a project. |
| Set Table RLS | Write / may use credits | Set row-level security for a table. Modes: public (anyone), authenticated (any logged-in user), owner (only the user's own rows). 'owner' adds an owner column automatically. |
| Update Team Member | Write / may use credits | Change a team member between full access and selected-project access. |

## Example workflow

Import [the included example](examples/account-check.json), select your credential, and execute the manual trigger. It runs **List Projects** once and outputs the account response. Replace the trigger with a schedule to build a recurring report, then connect a filter, spreadsheet or notification node.

For operations that return IDs, map the returned ID into the required field of a second MCPBackend node. Returned arrays stay inside the response object; use n8n's **Split Out** node when you need one item per record. Pagination fields are exposed only where the product supports them; advance the cursor/page explicitly rather than assuming all records were fetched.

## Writes and account limits

Write operations require **Confirm Write Operation**. Review the inputs before enabling it: every workflow execution may repeat the action, create a draft, change account data, or consume product credits depending on the selected operation. The node does not retry write operations automatically. Use read-only operations for monitoring and deduplicate scheduled workflows that create data. Product authorization remains enforced by the server.

## Error handling

- Reconnect OAuth after an authorization failure or revoked grant.
- Check account permissions and plan limits for forbidden or rate-limited responses.
- Invalid inputs stop the item before sending a request. Product-specific validation remains authoritative.
- **On Error → Continue** returns an error item linked to the original input. Failed MCP tool results are never returned as successful data.
- No passwords, environment variables, or customer data are bundled. No external runtime dependencies are installed by this package.

## Development

```sh
npm ci --ignore-scripts
npm run lint
npm test
```

Releases are built and tested in [GitHub Actions](https://github.com/mcpbackend/n8n-nodes-mcpbackend/actions), then published to npm with provenance. Public snapshots use GitHub Actions bot attribution.

## Links

- [Website](https://mcpbackend.com)
- [Privacy policy](https://mcpbackend.com/privacy/)
- [Source and issues](https://github.com/mcpbackend/n8n-nodes-mcpbackend)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

MIT licensed. This community integration is not an n8n core node.
