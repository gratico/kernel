import { IFileSystem } from '@gratico/fs'
import { IEventEmitter } from '../specs/emitter'
import EventEmitter2 from 'emittery'

import { IBusNode, IRouteServer, IRouteHandler } from '@gratico/subway'
import { BroadcastChannel } from 'broadcast-channel'

// todo remove these unused
import { IProject, IRepository, IUser } from './business'

export interface GITParams {
	file: string
	repo: string
	branch: string
	type: 'git'
}
export interface LocalParams {
	file: string
	path: string
	type: '~'
}
export type FileParams = LocalParams // | GITParams

export interface IDoc<T = any> {
	_id: string
	parentId: string
	type: string
	name: string
	payload?: T
}

export interface IKernelConfig {
	viewer?: IUser
	project: IProject
}
export interface IKernelLoci {
	id: string
	parentId?: string
	type: 'worker' | 'master' | 'viewport'
}
export interface IKernelMeta {
	leader: boolean
	peers: Record<string, any>
	id: string
	parentId?: string
}
export interface IKernel {
	config: IKernelConfig
	loci: IKernelLoci
	cache: Map<any, any>
	channel: BroadcastChannel
	meta: IKernelMeta
	emitters: {
		notifications: IEventEmitter
		logs: IEventEmitter
		directory: IEventEmitter
		viewport: IEventEmitter
		keyboard: IEventEmitter
		[key: string]: IEventEmitter
	}
	bus: IBusNode
	//privateStore: IStore;

	env: IEnvironmentVariables
	fs: IFileSystem
	server: IRouteServer<IKernel, unknown>
	extensions: IKernelExtension[]
}

export interface ILogger {}

export interface IProcessProps {
	logger: ILogger
	kernel: IKernel
	routes: IRouteHandler[]
}
export interface IProcess {
	logger: ILogger
	kernel: IKernel
	start: () => Promise<void>
	stop: () => Promise<void>
	routes: IRouteHandler<IKernel, unknown>[]
}

export interface IKernelManifestMeta {
	name: string
	description?: string
	icon?: { url: string } | { path: string } | { reactComponent: { exportName: string; moduleLocation: string } }
	homepage?: string
	author?: string
	repository?: string
}

export interface IKernelManifestAdvertisment {
	capabilities: string[]
	config: {
		[key: string]: any
	}
}
export interface IKernelManifest {
	id: string
	meta: IKernelManifestMeta
	advt: IKernelManifestAdvertisment
}
export interface IKernelExtension {
	id: string
	manifest: IKernelManifest
	moduleLocation?: IModuleLocation
	exportName?: string
	export?: any
}
export interface IEnvironmentVariables {
	[key: string]: string
}

export interface IModuleLocation {
	name: string
	exportName?: string
}
