import debug from 'debug';

import { MCPClient, MCPConnection } from '@/server/modules/MCPClient';
import { uuid } from '@/utils/uuid';

const log = debug('lobe-mcp:service'); // Use debug with the specified namespace

class MCPService {
  private connections: Map<string, MCPConnection> = new Map();
  // Store instances of the custom MCPClient, keyed by connection ID
  private clients: Map<string, MCPClient> = new Map();

  constructor() {
    log('MCPService initialized'); // Use log instead of logger.log
  }

  // --- 连接管理 ---

  async addConnection(connectionConfig: Omit<MCPConnection, 'id'>): Promise<MCPConnection> {
    const id = uuid(); // 生成唯一 ID
    const connection = { ...connectionConfig, id } as MCPConnection;

    log(`Adding MCP connection: ${connection.name} (${connection.type}) - ID: ${connection.id}`); // Use log

    try {
      // 1. Instantiate the custom MCPClient
      const client = new MCPClient(connection);
      // 2. Initialize the connection (this happens inside MCPClient)
      await client.initialize();

      // 3. Store the connection configuration
      this.connections.set(id, connection);
      // 4. Store the initialized client instance
      this.clients.set(id, client);

      log(`MCP connection added successfully: ${id}`); // Use log
      // TODO: 持久化存储 connections Map
      return connection;
    } catch (error) {
      // Revert error logging to console.error
      console.error(`Failed to add MCP connection ${connection.id}:`, error);
      // Clean up if initialization failed - remove config if it was added by mistake (though unlikely here)
      this.connections.delete(id); // Ensure config is also removed on failure
      this.clients.delete(id); // Ensure client instance (if partially created) is removed
      throw new Error(`Failed to initialize MCP connection: ${(error as Error).message}`);
    }
  }

  listConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }

  async removeConnection(id: string): Promise<boolean> {
    log(`Removing MCP connection: ${id}`); // Use log
    // Retrieve the client instance
    const client = this.clients.get(id);

    if (client) {
      // TODO: If MCPClient implements a disconnect/shutdown method, call it here.
      // e.g., await client.disconnect();
      log(`MCPClient instance found for ${id}. Removing from active clients.`); // Use log
      this.clients.delete(id);
    } else {
      // Revert warning to console.warn (or keep as log if preferred, but console.warn might be better)
      console.warn(`No active MCPClient instance found for connection ID: ${id}`);
      // log(`Warning: No active MCPClient instance found for connection ID: ${id}`); // Use log
    }

    // Remove connection configuration regardless of client state
    const deleted = this.connections.delete(id);
    if (deleted) {
      log(`MCP connection configuration removed: ${id}`); // Use log
      // TODO: 从持久化存储中移除
    } else {
      // Revert warning to console.warn
      console.warn(`MCP connection configuration not found for removal: ${id}`);
      // log(`Warning: MCP connection configuration not found for removal: ${id}`); // Use log
    }
    // Return true if the configuration was found and deleted
    return deleted;
  }

  // --- MCP 交互 ---

  async listTools(connectionId: string): Promise<any> {
    // Retrieve the managed MCPClient instance
    const client = this.clients.get(connectionId);
    if (!client) {
      throw new Error(`MCP connection not found or not active: ${connectionId}`);
    }
    log(`Listing tools for connection: ${connectionId} using MCPClient.`); // Use log
    try {
      // Delegate the call to the MCPClient instance
      const result = await client.listTools();
      log(`Tools listed successfully for: ${connectionId}, result: %O`, result); // Use log, %O for object
      return result; // TODO: Potentially use specific types from MCP SDK / MCPClient
    } catch (error) {
      // Revert error logging to console.error
      console.error(`Error listing tools for ${connectionId} via MCPClient:`, error);
      // log(`Error listing tools for ${connectionId} via MCPClient: %O`, error); // Use log, %O for error object
      throw error; // Re-throw the error to be handled by the caller (e.g., tRPC router)
    }
  }

  async callTool(connectionId: string, toolName: string, params: any): Promise<any> {
    // Retrieve the managed MCPClient instance
    const client = this.clients.get(connectionId);
    if (!client) {
      throw new Error(`MCP connection not found or not active: ${connectionId}`);
    }
    log(`Calling tool "${toolName}" on connection: ${connectionId} with params: %O`, params); // Use log, %O for params
    try {
      // Delegate the call to the MCPClient instance
      // Note: MCPClient expects 'args' as the second parameter for the tool call.
      const result = await client.callTool(toolName, params);
      log(`Tool "${toolName}" called successfully for: ${connectionId}, result: %O`, result); // Use log, %O for result
      return result; // TODO: Potentially use specific types from MCP SDK / MCPClient
    } catch (error) {
      // Revert error logging to console.error
      console.error(`Error calling tool "${toolName}" for ${connectionId} via MCPClient:`, error);
      // log(`Error calling tool "${toolName}" for ${connectionId} via MCPClient: %O`, error); // Use log, %O for error object
      throw error; // Re-throw the error
    }
  }

  // TODO: 添加 listResources, getResource, listPrompts, getPrompt 等方法
}

// 导出一个单例实例
export const mcpService = new MCPService();
