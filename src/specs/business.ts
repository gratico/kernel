export type IProject = any
export type IUser = any
export type IRepository = any

export interface INotficationPayloadSimpleItem {
  label: string
  description: string
  value?: number
}

export type INotficationPayloadItem = INotficationPayloadSimpleItem
export interface INotficationPayload {
  items: INotficationPayloadItem[]
}
export interface INotification {
  id: string
  threadId: string
  payload: INotficationPayload
  timeout?: number
  timestamp: string
  autoDismiss?: boolean
}

export interface IFileBuffer {
  id: string
  workspaceUID: string
  applicationId: string
  args: Record<any, any>[]
  branchName?: string
  repoName?: string
  filePath?: string
}
