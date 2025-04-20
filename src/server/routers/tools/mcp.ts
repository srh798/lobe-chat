import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { isDesktop, isServerMode } from '@/const/version';
import { passwordProcedure } from '@/libs/trpc/edge';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { mcpService } from '@/server/services/mcp';

// TODO: password procedure 未来的处理方式可能要思考下
const mcpProcedure = isServerMode ? authedProcedure : passwordProcedure;

// ---

export const mcpRouter = router({
  // --- 连接管理 ---
  addHttpConnection: mcpProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      return await mcpService.addConnection({
        name: input.name,
        type: 'http',
        url: input.url,
      });
    }),

  addStdioConnection: mcpProcedure
    .input(
      z.object({
        args: z.array(z.string()).optional().default([]),
        command: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      // Stdio 仅能在 Node 环境使用，这里可能需要运行时检查或依赖部署环境
      if (!isDesktop) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Stdio connections can only be added from the server environment.',
        });
      }

      return await mcpService.addConnection({
        ...input,
        args: input.args,
        name: input.name,
        type: 'stdio',
      });
    }),

  callTool: mcpProcedure
    .input(
      z.object({
        connectionId: z.string(),
        params: z.any(),
        toolName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await mcpService.callTool(input.connectionId, input.toolName, input.params);
    }),

  listConnections: mcpProcedure.query(async () => {
    return mcpService.listConnections();
  }),

  // --- MCP 交互 ---
  listTools: mcpProcedure.input(z.object({ connectionId: z.string() })).query(async ({ input }) => {
    return await mcpService.listTools(input.connectionId);
  }),

  removeConnection: mcpProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return await mcpService.removeConnection(input.id);
  }),
});
