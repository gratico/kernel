import { IKernel } from '../specs/kernel'

export type IPusher = any
export type IPresenceChannel = any
export const Pusher: any = {} as any

export function createPusher(kernel: IKernel) {
  //  const pusher = new Pusher("e3a887e04d3396f7ba52", {
  //    auth: {
  //      headers: {
  //        "X-Workspace-Token": kernel.config.token,
  //        "X-Id": kernel.bus.id,
  //      },
  //    },
  //    cluster: "eu",
  //    authEndpoint: "/_/pusher/auth",
  //  });
  //  //console.log(pusher);
  //  return pusher;
  return {}
}
//Pusher.logToConsole = true;
