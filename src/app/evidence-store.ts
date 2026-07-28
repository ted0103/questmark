const DB_NAME = "questmark-local";
const STORE = "evidence";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE, mode);
    const request = action(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export const putEvidence = (key: string, blob: Blob) => run("readwrite", (store) => store.put(blob, key));
export const getEvidence = (key: string) => run<Blob | undefined>("readonly", (store) => store.get(key));
export const deleteEvidence = (key: string) => run("readwrite", (store) => store.delete(key));
export const clearEvidence = () => run("readwrite", (store) => store.clear());

export async function pruneEvidence(validKeys: Set<string>) {
  const keys = await run<IDBValidKey[]>("readonly", (store) => store.getAllKeys());
  await Promise.all(keys.filter((key) => typeof key === "string" && !validKeys.has(key)).map((key) => deleteEvidence(String(key))));
}
