const BASE = '../data';

export async function loadJSON(filename) {
  const response = await fetch(`${BASE}/${filename}`);
  if (!response.ok) throw new Error(`Failed to load ${filename}`);
  return response.json();
}

let _cache = {};

export async function getData(filename) {
  if (_cache[filename]) return _cache[filename];
  _cache[filename] = await loadJSON(filename);
  return _cache[filename];
}

export function clearCache() {
  _cache = {};
}
