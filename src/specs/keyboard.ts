export interface IKeyboardKeyMapItem {
  keys: string[]
  subject?: string
  payload?: any
  label?: string
  target?:
    | 'Kernel'
    | { type: 'Application'; processSelector: object; upsert?: any }
    | { type: 'Buffer' }
    | 'Spatial'
    | 'Phony'
}

export interface IKeyboardKeyMap {
  id: string
  keys: IKeyboardKeyMapItem[]
}
export interface IKeyboardRegion {
  id: string
  locked?: boolean
  parentId?: string
}

export interface IKeyboardSelectionState {
  activeSequence: string[]
}
export interface IKeyboardDOMState {
  providerId: string
  // todo: add typings for this
  regions: IKeyboardRegion[]
  regionsState: { [regionId: string]: HTMLElement }
}
export type IKeyboardState = IKeyboardSelectionState & IKeyboardDOMState
