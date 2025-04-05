import { syncManager } from '../services/syncManager';

class OfflineStorage {
  constructor() {
    this.db = null;
    this.dbName = 'solarmed-offline';
    this.dbVersion = 1;
    this.stores = {
      patients: 'patients',
      diagnoses: 'diagnoses',
      energy: 'energy',
      settings: 'settings'
    };
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        Object.values(this.stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async add(storeName, data) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.add(data);

      request.onsuccess = () => {
        // Add to sync queue
        syncManager.addToSyncQueue({
          store: storeName,
          action: 'add',
          data: data
        });
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async update(storeName, data) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put(data);

      request.onsuccess = () => {
        // Add to sync queue
        syncManager.addToSyncQueue({
          store: storeName,
          action: 'update',
          data: data
        });
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(storeName, id) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        // Add to sync queue
        syncManager.addToSyncQueue({
          store: storeName,
          action: 'delete',
          id: id
        });
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get(storeName, id) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clear(storeName) {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async sync() {
    if (!this.db) await this.initialize();

    // Get all data from all stores
    const data = {};
    for (const storeName of Object.values(this.stores)) {
      data[storeName] = await this.getAll(storeName);
    }

    // Add to sync queue
    await syncManager.addToSyncQueue({
      action: 'sync',
      data: data
    });
  }
}

export const offlineStorage = new OfflineStorage(); 