import { v4 } from 'uuid'
import { IKernel, IKernelExtension } from '../specs/kernel'
import { EventEmitter as KernelEventEmitter } from '@oss-stealth/utils/dist/co/emitter'
import { kernelFactory } from './index'
import { InMemoryAdapter } from '@gratico/fs'
import { IRouteHandler } from '@gratico/subway'

import { BootProps } from './index'

export async function boot(
  props: BootProps,
  routes: IRouteHandler[],
  extensions: IKernelExtension[],
): Promise<IKernel> {
  const id = v4()

  const notificationsEmitter = new KernelEventEmitter()
  const logsEmitter = new KernelEventEmitter()
  const emitters = {
    notifications: notificationsEmitter,
    logs: logsEmitter,
    keyboard: new KernelEventEmitter(),
  }
  const kernel = await kernelFactory({
    loci: {
      id,
      type: 'master',
    },
    config: props,
    extensions,
    busMeta: { type: 'master' },
    emitters,
    createAdapter: async (name: string, config: Record<any, any>) => new InMemoryAdapter(),
    env: {},
    routes: [...[], ...routes],
  })
  return kernel
}
