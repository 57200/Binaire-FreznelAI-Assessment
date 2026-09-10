const KEY = "binaire-models";

export class OfflineCache {
  static save(data: unknown) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  static load<T>(): T | null {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : null;
  }
}