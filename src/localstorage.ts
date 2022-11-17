/// <reference lib="DOM" />

import { dirname } from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'

function homedir() {
  const env = process.env;
  const home = env.HOME;
  const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

  if (process.platform === "win32") {
    return env.USERPROFILE || env.HOMEDRIVE! + env.HOMEPATH! || home || null;
  }

  if (process.platform === "darwin") {
    return home || (user ? "/Users/" + user : null);
  }

  if (process.platform === "linux") {
    return home ||
      (process.getuid!() === 0 ? "/root" : (user ? "/home/" + user : null));
  }

  return home || null;
}

export class LocalStorage implements Storage {
  _path: string
  constructor(path: string) {
    this._path = path.replace(/^~/, homedir() ?? '')
    try {
      mkdirSync(dirname(this._path), { recursive: true})
    } catch (e: any) {
      if (e.code !== 'EEXIST') throw e
    }
  }

  _readData(): Record<string, string> {
    try {
      return JSON.parse(readFileSync(this._path, 'utf8'))
    } catch {
      return {}
    }
  }

  _persistData(data: Record<string, string>) {
    writeFileSync(this._path, JSON.stringify(data))
  }

  get length(): number {
    return Object.keys(this._readData()).length
  }

  clear(): void {
    this._persistData({})
  }

  getItem(key: string): string | null {
    const data = this._readData()
    return data[key] ?? null;
  }

  key(index: number): string | null {
    const data = this._readData()
    return Object.keys(data)[index] ?? null
  }

  removeItem(key: string): void {
    const data = this._readData()
    delete data[key]
    this._persistData(data)
  }

  setItem(key: string, value: string): void {
    const data = this._readData()
    data[key] = value
    this._persistData(data)
  }
}

export const localStorage: Storage = new Proxy(new LocalStorage('~/.denostack/shim-webstore.json'), {
  get(target, prop) {
    if (prop in target) return (target as any)[prop]
    return target.getItem(prop as string)
  },
  set(target, prop, value) {
    if (prop in target) {
      return false
    }
    target.setItem(prop as string, value as string)
    return true
  },
})
