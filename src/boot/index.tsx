import { createBus, IBusNode, fetchRequest } from '@gratico/subway'
import { IKernel, IEnvironmentVariables, IKernelExtension, IKernelConfig, IKernelLoci, IKernelMeta } from '../specs'
import { IFileSystemAdapter, IAdapterNodeRecord, IFileSystem } from '@gratico/fs'
import pify from 'pify'
import { IRequest, IResponse, IRouteHandlerRequest, IRouteHandler, IRouteHandlerFunction } from '@gratico/subway'
import { Method } from 'tiny-request-router'
import { FS } from '@gratico/fs'

import { IEventEmitter } from '../specs/emitter'
import EventEmitter from 'emittery'
import { Router } from 'tiny-request-router'
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel'

import { loadFilesystem } from './utils/index'

export async function justTryAsync(fn: Promise<any>) {
  try {
    await fn
  } catch (e) {
    //console.error(e)
  }
}

export type BootProps = IKernelConfig
export interface KernelProps {
  loci: IKernelLoci
  config: IKernelConfig
  env: IEnvironmentVariables
  extensions: IKernelExtension[]
  busMeta: Record<string, unknown>
  routes: IRouteHandler<IKernel, unknown>[]
  emitters: {
    notifications: IEventEmitter
    keyboard: IEventEmitter
    logs: IEventEmitter
    [key: string]: IEventEmitter
  }
  createAdapter: (name: string, config: Record<string, unknown>) => Promise<IFileSystemAdapter<IAdapterNodeRecord>>
}
// master updates itself
//
export function sendHeartbeat(kernel: IKernel) {
  const {
    meta,
    channel,
    loci: { id },
  } = kernel
  channel.postMessage({
    type: 'heartbeet',
    from: id,
    meta: {
      leader: meta.leader,
      timestamp: new Date().getTime(),
      parentId: kernel.loci.parentId,
      type: kernel.loci.type,
      id: kernel.loci.id,
    },
  })
}

export async function kernelFactory(props: KernelProps): Promise<IKernel> {
  console.log(props)
  // de76e9be-e828-431a-9586-3d18630ee9bd
  const { loci, config, env, extensions, busMeta, routes, emitters, createAdapter } = props
  const server = {
    handlers: routes,
  }
  //  const awareness = new Awareness({ clientID: store.doc.clientID } as any);
  //  awareness.setLocalState({});
  const bus = createBus(loci.id, busMeta, (req, pkt) => requestHandler(req, pkt))
  const adapter = await createAdapter('project/' + '', { bus })
  const fs = new FS(adapter)

  try {
    await pify(fs.mkdir)('/')
  } catch (e) {
    console.log(e)
  }

  await loadFilesystem(props.config.project.id, fs)

  await justTryAsync(pify(fs.mkdir)('/'))
  await justTryAsync(pify(fs.mkdir)('/checkouts'))
  await justTryAsync(pify(fs.mkdir)('/system'))
  await justTryAsync(
    pify(fs.writeFile)(
      '/.git/config',
      `
[remote "origin"]
  fetch = +refs/heads/*:refs/remotes/origin/*

`,
    ),
  )
  const id = loci.type + '/' + loci.id
  const sharedStores = new Map()
  //  const channel = new BroadcastChannel(config.project.id)
  //  const elector = createLeaderElection(channel)
  const meta = {}
  const kernel: IKernel = {
    fs,
    bus,
    channel: null as any,
    meta: meta as any,
    cache: new Map(),
    env,
    config,
    loci,
    extensions: [...extensions],
    emitters: {
      ...emitters,
      keyboard: new EventEmitter(),
      directory: new EventEmitter(),
      viewport: new EventEmitter(),
    },
    server,
  }
  //  elector.awaitLeadership().then(() => {
  //    console.log('this tab is now leader')
  //    kernel.meta.leader = true
  //  })//

  //  elector.broadcastChannel.addEventListener('internal', (msg) => {
  //    //console.log('msg', msg)
  //  })//

  //  setInterval(sendHeartbeat.bind(null, kernel), 1000)//

  //  channel.addEventListener('message', (msg) => {
  //    //console.log('msg', msg)
  //    kernel.meta.peers[msg.from] = msg.meta
  //  })

  async function requestHandler(request: IRequest, packet: any): Promise<IResponse> {
    const method = (request.method || 'get').toUpperCase()
    const router = getRouter(bus, server.handlers)
    const routeMatch = router.match(method as Method, request.pathname)
    if (routeMatch && routeMatch.handler) {
      const req: IRouteHandlerRequest = {
        incoming: {
          url: request.pathname,
          params: routeMatch.params,
          body: request.body,
          method: request.method || 'get',
          headers: {},
        },
        context: kernel,
        envelop: {
          id: packet.id,
          from: packet.from,
          to: packet.to,
          path: packet.path,
        },
      }
      try {
        const body = await (routeMatch.handler as IRouteHandlerFunction)(req)
        return { statusCode: 200, body }
      } catch (e) {
        console.error(e)
        return { statusCode: 503, body: {} }
      }
    } else {
      return { statusCode: 404, body: {} }
    }
  }
  const resp = await fetchRequest<{}>(
    bus,
    {
      method: 'get',
      host: kernel.bus.id,
      pathname: '/@system/info',
      body: {},
    },
    {},
  )

  console.log('kernel resp', resp)
  //
  return kernel
}

// todo: use fsm here from @thi.ng/fsm

export async function createWorkerThread<SuccessPayload = unknown, BootPayload = unknown>(
  workerURL: string,
  bootPayload?: BootPayload,
): Promise<[SuccessPayload, Worker]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerURL, {
      // type: "module",
    })
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'GRATICO_READY') {
        worker.postMessage({ type: 'GRATICO_BOOT', payload: bootPayload })
      } else if (e.data && e.data.type === 'GRATICO_BOOT_SUCCESS') {
        worker.removeEventListener('message', handler)

        resolve([e.data.payload as SuccessPayload, worker])
      } else if (e.data && e.data.type === 'GRATICO_BOOT_FAILURE') {
        worker.removeEventListener('message', handler)
        reject(new Error('GRATICO_BOOT_ERROR'))
      }
    }
    worker.addEventListener('message', handler)
  })
}
// todo: use fsm here from @thi.ng/fsm
export async function createSharedThread<SuccessPayload = unknown>(
  workerURL: string,
  id: string,
  cluserName: string,
  bootPayload?: unknown,
): Promise<[SuccessPayload, MessagePort]> {
  try {
    const worker = new SharedWorker(workerURL, {
      name: id + '/' + cluserName,
      // type: "module",
    })
    return new Promise(function (resolve, reject) {
      const bootHandler = async (e: MessageEvent) => {
        console.info(
          '%c@shell/createThread/bootHandler',
          'background: darkslategrey;padding: 1px;border-radius: 1px;color: white;',
          e?.data?.type ? e.data.type : '',
        )
        if (e.data && e.data.type === 'GRATICO_BOOT_SUCCESS') {
          worker.port.removeEventListener('message', bootHandler, false)
          resolve([e.data.payload as SuccessPayload, worker.port])
        } else if (e.data && e.data.type === 'GRATICO_BOOT_FAILURE') {
          reject(e.data.payload)
        }
      }
      worker.port.addEventListener('message', bootHandler, false)
      worker.port.start()
      worker.port.postMessage({ type: 'GRATICO_BOOT', payload: bootPayload })
    })
  } catch (e) {
    console.error(e)
    throw e
  }
}

export function getRouter(bus: IBusNode, routeHandlers: IRouteHandler<IKernel, unknown>[] = []) {
  const router = new Router()
  const allRoutes: IRouteHandler<IKernel, unknown>[] = [
    ...routeHandlers,
    {
      method: 'get',
      path: '/@system/info',
      handler: async () => {
        return bus.peers.map((el) => ({ id: el.id }))
      },
    },
  ]

  allRoutes.forEach((route) => {
    router[route.method || 'get'](route.path, route.handler)
  })
  return router
}
