/**
 * localStorage 기반 제네릭 Repository.
 * 향후 실제 API/DB로 교체할 때는 이 Repository<T> 인터페이스를 구현하는
 * HTTP 기반 구현체로 바꿔 끼우면 되며, Service/컴포넌트 레이어는 수정할 필요가 없다.
 */
export interface Repository<T extends { id: string }> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: T): T;
  update(item: T): T;
  remove(id: string): void;
  replaceAll(items: T[]): void;
}

export function createLocalStorageRepository<T extends { id: string }>(storageKey: string): Repository<T> {
  function readAll(): T[] {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  function writeAll(items: T[]): void {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  return {
    getAll: readAll,
    getById(id) {
      return readAll().find((item) => item.id === id);
    },
    create(item) {
      const items = readAll();
      items.push(item);
      writeAll(items);
      return item;
    },
    update(item) {
      const items = readAll();
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx >= 0) items[idx] = item;
      else items.push(item);
      writeAll(items);
      return item;
    },
    remove(id) {
      writeAll(readAll().filter((i) => i.id !== id));
    },
    replaceAll(items) {
      writeAll(items);
    },
  };
}

/** 단일 객체(설정 등)를 저장하는 간단한 스토어 */
export interface SingletonStore<T> {
  get(): T | undefined;
  set(value: T): void;
}

export function createLocalStorageSingleton<T>(storageKey: string): SingletonStore<T> {
  return {
    get() {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return undefined;
      }
    },
    set(value) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
  };
}
