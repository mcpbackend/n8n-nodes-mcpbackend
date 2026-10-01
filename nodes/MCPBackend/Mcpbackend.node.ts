import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";
import { executeOperations, type Operation, type ResourceRoute } from "./transport";
import operations from "./operations.json";
import properties from "./properties.json";
import routes from "./routes.json";

export class Mcpbackend implements INodeType {
  description: INodeTypeDescription = {
    displayName: "MCPBackend",
    name: "mcpbackend",
    icon: { light: "file:mcpbackend.svg", dark: "file:mcpbackend.svg" },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Automate your MCPBackend account",
    defaults: { name: "MCPBackend" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "mcpbackendOAuth2Api", required: true }],
    properties: properties as INodeProperties[],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return executeOperations(
      this,
      "https://mcp.mcpbackend.com",
      "mcpbackendOAuth2Api",
      operations as unknown as Operation[],
      routes as Record<string,ResourceRoute>,
    );
  }
}
