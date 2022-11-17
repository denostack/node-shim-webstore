/// <reference lib="DOM" />

export class SessionStorage implements Storage {
  _data: Record<string, string> = {}

  get length(): number {
    return Object.keys(this._data).length
  }

  clear(): void {
    this._data = {}
  }

  getItem(key: string): string | null {
    return this._data[key] ?? null
  }

  key(index: number): string | null {
    return Object.keys(this._data)[index] ?? null
  }

  removeItem(key: string): void {
    delete this._data[key]
  }

  setItem(key: string, value: string): void {
    this._data[key] = value
  }
}

export const sessionStorage: Storage = new Proxy(new SessionStorage(), {
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
