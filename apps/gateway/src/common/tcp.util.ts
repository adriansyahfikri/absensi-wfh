import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface RpcErrorShape {
  statusCode?: number;
  message?: string;
}

export async function sendTcp<T>(
  client: ClientProxy,
  pattern: Record<string, string>,
  data: unknown,
): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (error) {
    const rpcError = error as RpcErrorShape;
    throw new HttpException(
      rpcError?.message ?? 'Unexpected error from downstream service',
      rpcError?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
