import { v4 } from 'uuid'
import { IKernel } from '../specs'
import { EventEmitter as KernelEventEmitter } from '@oss-stealth/utils/dist/co/emitter'
import { kernelFactory } from './index'
import { createIndexedDBAdapter as createAdapter } from '@gratico/fs'
import { IRouteHandler } from '@gratico/subway'

import { BootProps } from './index'

const routes: IRouteHandler[] = []

export async function bootViewportKernel(props: BootProps): Promise<IKernel> {
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
      type: 'viewport',
    },
    config: props,
    extensions: [],
    busMeta: { type: 'viewport' },
    emitters,
    createAdapter,
    env: {},
    routes: [...[], ...routes],
  })
  return kernel
}
