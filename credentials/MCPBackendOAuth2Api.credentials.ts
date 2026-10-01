import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class MCPBackendOAuth2Api implements ICredentialType {
  name = "mcpbackendOAuth2Api";
  displayName = "MCPBackend OAuth2 API";
  documentationUrl =
    "https://github.com/mcpbackend/n8n-nodes-mcpbackend#authentication";
  icon = { light: "file:mcpbackend.svg", dark: "file:mcpbackend.svg" } as const;
  extends = ["oAuth2Api"];
  properties: INodeProperties[] = [
    {
      displayName: "Use Dynamic Client Registration",
      name: "useDynamicClientRegistration",
      type: "hidden",
      default: true,
    },
    {
      displayName: "Server URL",
      name: "serverUrl",
      type: "hidden",
      default: "https://mcp.mcpbackend.com/v1",
    },
    {
      displayName: "Resource URL",
      name: "resourceUrl",
      type: "hidden",
      default: "https://mcp.mcpbackend.com/v1",
    },
  ];
}
