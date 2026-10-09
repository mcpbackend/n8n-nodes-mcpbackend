import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeOperations, type Operation, type ResourceRoute } from './transport';
import operations from './operations.json';
import routes from './routes.json';

export class Mcpbackend implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MCPBackend',
		name: 'mcpbackend',
		icon: { light: 'file:mcpbackend.svg', dark: 'file:mcpbackend.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Automate your MCPBackend account',
		defaults: { name: 'MCPBackend' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'mcpbackendOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'API Key',
						value: 'api-key',
					},
					{
						name: 'Project',
						value: 'projects',
					},
					{
						name: 'Schema',
						value: 'schema',
					},
					{
						name: 'Team Member',
						value: 'team',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'projects',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create API Key',
						value: 'create_api_key',
						description:
							"Create a server-side API key for a project's data API. Empty permissions = full access; otherwise per-table {table, read, create, update, delete}. Returns the secret once. The secret grants server-side access and is unsuitable for public client code",
						action: 'Create api key in mcp backend',
					},
				],
				default: 'create_api_key',
				displayOptions: {
					show: {
						resource: ['api-key'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Project',
						value: 'create_project',
						description:
							'Create a new project. Provisions a dedicated database and returns the project ID plus canonical application API URLs.',
						action: 'Create project in mcp backend',
					},
					{
						name: 'Get Project',
						value: 'get_project',
						description:
							'Get an existing project by ID, including its canonical data-plane API URLs',
						action: 'Get project in mcp backend',
					},
					{
						name: 'Get Project API',
						value: 'get_project_api',
						description:
							'Get the exact runtime API contract for an existing or newly created project. Returns canonical route templates, security guidance, and the generated OpenAPI document.',
						action: 'Get project api in mcp backend',
					},
					{
						name: 'Get Usage',
						value: 'get_usage',
						description: 'Get the current-month usage and plan limits for a project',
						action: 'Get usage in mcp backend',
					},
					{
						name: 'List Projects',
						value: 'list_projects',
						description:
							"List the caller's McpBackend projects. Each project includes canonical data-plane API URLs.",
						action: 'List projects in mcp backend',
					},
					{
						name: 'Set Auth Enabled',
						value: 'set_auth_enabled',
						description: 'Enable or disable end-user (email/password) authentication for a project',
						action: 'Set auth enabled in mcp backend',
					},
				],
				default: 'list_projects',
				displayOptions: {
					show: {
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Column',
						value: 'add_column',
						description:
							'Add a column to an existing table. NOT NULL columns require a defaultValue.',
						action: 'Add column in mcp backend',
					},
					{
						name: 'Create Table',
						value: 'create_table',
						description:
							"Create a table in a project's database. A primary-key column is added automatically unless you define your own.",
						action: 'Create table in mcp backend',
					},
					{
						name: 'Get Schema',
						value: 'get_schema',
						description:
							'Get the tables/columns schema of a project. This describes the storage schema.',
						action: 'Get schema in mcp backend',
					},
					{
						name: 'Set Table RLS',
						value: 'set_table_rls',
						description:
							"Set row-level security for a table. Modes: public (anyone), authenticated (any logged-in user), owner (only the user's own rows). 'owner' adds an owner column automatically",
						action: 'Set table rls in mcp backend',
					},
				],
				default: 'add_column',
				displayOptions: {
					show: {
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Add Team Member',
						value: 'add_team_member',
						description:
							'Add a team member by email with full access or access to selected projects. Sends an invitation email.',
						action: 'Add team member in mcp backend',
					},
					{
						name: 'List Team Members',
						value: 'list_team_members',
						description:
							'List team members, their access scope, and projects owned by the caller for assignment',
						action: 'List team members in mcp backend',
					},
					{
						name: 'Remove Team Member',
						value: 'remove_team_member',
						description:
							"Remove a member from the caller's team and revoke all shared project access",
						action: 'Remove team member in mcp backend',
					},
					{
						name: 'Update Team Member',
						value: 'update_team_member',
						description: 'Change a team member between full access and selected-project access',
						action: 'Update team member in mcp backend',
					},
				],
				default: 'add_team_member',
				displayOptions: {
					show: {
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Webhook',
						value: 'create_webhook',
						description:
							"Create a webhook that POSTs on row changes. events like ['posts.created','*.deleted','*']. Returns the signing secret once",
						action: 'Create webhook in mcp backend',
					},
				],
				default: 'create_webhook',
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
			},
			{
				displayName:
					'This operation changes data or may use account credits. Review the inputs and the product permissions before running this workflow.',
				name: 'writeNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'add_column',
							'add_team_member',
							'create_api_key',
							'create_project',
							'create_table',
							'create_webhook',
							'remove_team_member',
							'set_auth_enabled',
							'set_table_rls',
							'update_team_member',
						],
						resource: ['api-key', 'projects', 'schema', 'team', 'webhook'],
					},
				},
			},
			{
				displayName: 'Confirm Write Operation',
				name: 'confirmWrite',
				type: 'boolean',
				default: false,
				description:
					'Whether you authorize this workflow to run the selected write operation, including any applicable product credits',
				displayOptions: {
					show: {
						operation: [
							'add_column',
							'add_team_member',
							'create_api_key',
							'create_project',
							'create_table',
							'create_webhook',
							'remove_team_member',
							'set_auth_enabled',
							'set_table_rls',
							'update_team_member',
						],
						resource: ['api-key', 'projects', 'schema', 'team', 'webhook'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'add_column__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['add_column'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Table',
				name: 'add_column__table',
				type: 'string',
				default: '',
				required: true,
				description: 'The table for this operation',
				displayOptions: {
					show: {
						operation: ['add_column'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Column',
				name: 'add_column__column',
				type: 'json',
				default: '{}',
				required: true,
				description: 'The column for this operation',
				displayOptions: {
					show: {
						operation: ['add_column'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Email',
				name: 'add_team_member__email',
				type: 'string',
				default: '',
				required: true,
				description: 'The email for this operation',
				displayOptions: {
					show: {
						operation: ['add_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Access',
				name: 'add_team_member__access',
				type: 'options',
				default: 'full',
				required: true,
				description: 'The access for this operation',
				options: [
					{
						name: 'Full',
						value: 'full',
					},
					{
						name: 'Project',
						value: 'project',
					},
				],
				displayOptions: {
					show: {
						operation: ['add_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_add_team_member',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['add_team_member'],
						resource: ['team'],
					},
				},
				options: [
					{
						displayName: 'Project IDs',
						name: 'projectIds',
						type: 'json',
						default: '[]',
						description: 'Required when access is project',
					},
				],
			},
			{
				displayName: 'Project ID',
				name: 'create_api_key__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['create_api_key'],
						resource: ['api-key'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'create_api_key__name',
				type: 'string',
				default: '',
				required: true,
				description: 'The name for this operation',
				displayOptions: {
					show: {
						operation: ['create_api_key'],
						resource: ['api-key'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_api_key',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_api_key'],
						resource: ['api-key'],
					},
				},
				options: [
					{
						displayName: 'Permissions',
						name: 'permissions',
						type: 'json',
						default: '[]',
						description: 'The permissions for this operation',
					},
				],
			},
			{
				displayName: 'Name',
				name: 'create_project__name',
				type: 'string',
				default: '',
				required: true,
				description: 'Human-readable project name',
				displayOptions: {
					show: {
						operation: ['create_project'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_project',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_project'],
						resource: ['projects'],
					},
				},
				options: [
					{
						displayName: 'Jurisdiction',
						name: 'jurisdiction',
						type: 'options',
						default: 'eu',
						description: 'Optional EU data residency',
						options: [
							{
								name: 'Eu',
								value: 'eu',
							},
						],
					},
				],
			},
			{
				displayName: 'Project ID',
				name: 'create_table__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['create_table'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'create_table__name',
				type: 'string',
				default: '',
				required: true,
				description: 'The name for this operation',
				displayOptions: {
					show: {
						operation: ['create_table'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Columns',
				name: 'create_table__columns',
				type: 'json',
				default: '[]',
				required: true,
				description: 'The columns for this operation',
				displayOptions: {
					show: {
						operation: ['create_table'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_table',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_table'],
						resource: ['schema'],
					},
				},
				options: [
					{
						displayName: 'Indexes',
						name: 'indexes',
						type: 'json',
						default: '[]',
						description: 'The indexes for this operation',
					},
				],
			},
			{
				displayName: 'Project ID',
				name: 'create_webhook__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['create_webhook'],
						resource: ['webhook'],
					},
				},
			},
			{
				displayName: 'URL',
				name: 'create_webhook__url',
				type: 'string',
				default: '',
				required: true,
				description: 'The URL for this operation',
				displayOptions: {
					show: {
						operation: ['create_webhook'],
						resource: ['webhook'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_webhook',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_webhook'],
						resource: ['webhook'],
					},
				},
				options: [
					{
						displayName: 'Events',
						name: 'events',
						type: 'json',
						default: '[]',
						description: 'The events for this operation',
					},
				],
			},
			{
				displayName: 'Project ID',
				name: 'get_project__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_project'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'get_project_api__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_project_api'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'get_schema__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_schema'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'get_usage__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_usage'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Member ID',
				name: 'remove_team_member__memberId',
				type: 'string',
				default: '',
				required: true,
				description: 'The member ID for this operation',
				displayOptions: {
					show: {
						operation: ['remove_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'set_auth_enabled__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['set_auth_enabled'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Enabled',
				name: 'set_auth_enabled__enabled',
				type: 'boolean',
				default: false,
				required: true,
				description: 'Whether the enabled for this operation',
				displayOptions: {
					show: {
						operation: ['set_auth_enabled'],
						resource: ['projects'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'set_table_rls__projectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The project ID for this operation',
				displayOptions: {
					show: {
						operation: ['set_table_rls'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Table',
				name: 'set_table_rls__table',
				type: 'string',
				default: '',
				required: true,
				description: 'The table for this operation',
				displayOptions: {
					show: {
						operation: ['set_table_rls'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Read',
				name: 'set_table_rls__read',
				type: 'options',
				default: 'public',
				required: true,
				description: 'The read for this operation',
				options: [
					{
						name: 'Public',
						value: 'public',
					},
					{
						name: 'Authenticated',
						value: 'authenticated',
					},
					{
						name: 'Owner',
						value: 'owner',
					},
				],
				displayOptions: {
					show: {
						operation: ['set_table_rls'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Write',
				name: 'set_table_rls__write',
				type: 'options',
				default: 'public',
				required: true,
				description: 'The write for this operation',
				options: [
					{
						name: 'Public',
						value: 'public',
					},
					{
						name: 'Authenticated',
						value: 'authenticated',
					},
					{
						name: 'Owner',
						value: 'owner',
					},
				],
				displayOptions: {
					show: {
						operation: ['set_table_rls'],
						resource: ['schema'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_set_table_rls',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['set_table_rls'],
						resource: ['schema'],
					},
				},
				options: [
					{
						displayName: 'Owner Column',
						name: 'ownerColumn',
						type: 'string',
						default: '',
						description: 'Defaults to owner_id',
					},
				],
			},
			{
				displayName: 'Member ID',
				name: 'update_team_member__memberId',
				type: 'string',
				default: '',
				required: true,
				description: 'The member ID for this operation',
				displayOptions: {
					show: {
						operation: ['update_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Access',
				name: 'update_team_member__access',
				type: 'options',
				default: 'full',
				required: true,
				description: 'The access for this operation',
				options: [
					{
						name: 'Full',
						value: 'full',
					},
					{
						name: 'Project',
						value: 'project',
					},
				],
				displayOptions: {
					show: {
						operation: ['update_team_member'],
						resource: ['team'],
					},
				},
			},
			{
				displayName: 'Update Fields',
				name: 'options_update_team_member',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['update_team_member'],
						resource: ['team'],
					},
				},
				options: [
					{
						displayName: 'Project IDs',
						name: 'projectIds',
						type: 'json',
						default: '[]',
						description: 'The project IDs for this operation',
					},
				],
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeOperations(
			this,
			'https://mcpbackend.com',
			'mcpbackendOAuth2Api',
			operations as unknown as Operation[],
			routes as Record<string, ResourceRoute>,
		);
	}
}
