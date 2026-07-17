import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface RpcErrorShape {
  statusCode?: number;
  message?: string;
}

// Message-pattern handlers in employee-service/attendance-service throw
// RpcException({ statusCode, message }) (see CONTEXT.md decision #6) — over
// TCP that arrives as a plain rejected value, not a real HttpException. This
// is the one place that translates it back into a proper HTTP response.
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
