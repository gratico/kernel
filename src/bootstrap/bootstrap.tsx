import { IKernel, IFileSystem } from '../specs'
import nodePath from 'path'

import promisify from 'pify'
import shortid from 'shortid'

export async function fileExists(fs: IFileSystem, path: string) {
  let exists = false
  try {
    const text = await promisify(fs.readFile)(path, 'utf8')
    exists = true
  } catch (e) {}
  return exists
}

export async function cloneBuildpack(kernel: IKernel) {
  const { fs } = kernel

  return { id: shortid.generate(), body: true }
}

const ROOT_FOLDER = 'system'
const SYSTEM_DIRS = ['tmp', 'npm', 'git', 'usr', 'var']
export async function ensureSystemDirectories(fs: IFileSystem): Promise<void> {
  // ensure root
  try {
    await promisify(fs.mkdir.bind(fs))(nodePath.join('/'))
  } catch (e) {}
  // ensure system
  try {
    await promisify(fs.mkdir.bind(fs))(nodePath.join('/system'))
  } catch (e) {}
  // ensure
  try {
    await promisify(fs.mkdir.bind(fs))(nodePath.join('/checkouts'))
  } catch (e) {}

  const rootDirs = await promisify(fs.readdir)(nodePath.join('/', ROOT_FOLDER))

  const dirsNeeded = SYSTEM_DIRS.filter((dirName) => rootDirs.indexOf(dirName) === -1)
  // DANGER: race condition when two tabs open at start time
  // console.log("rootDirs", rootDirs, dirsNeeded);
  await Promise.all(
    dirsNeeded.map(async (dirName) => {
      await promisify(fs.mkdir.bind(fs))(nodePath.join('/', ROOT_FOLDER, dirName))
    }),
  )
}
export async function ensureDirectoryStructure(kernel: IKernel) {
  await ensureSystemDirectories(kernel.fs)
}
