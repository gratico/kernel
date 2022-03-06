import { v4 } from 'uuid'
import { IKernel, IKernelExtension } from '../specs'
import { IRouteHandler } from '@gratico/subway'
import { EventEmitter as KernelEventEmitter } from '@oss-stealth/utils/dist/co/emitter'
import { kernelFactory } from './index'
import { createIndexedDBAdapter as createAdapter } from '@gratico/fs'
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
      type: 'worker',
    },
    config: props,
    extensions,
    busMeta: { type: 'worker' },
    emitters,
    createAdapter: (name: string, config: Record<any, any>) => createAdapter(name, config),
    env: {},
    routes: [...[], ...routes],
  })
  return kernel
}
