const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch (e) {
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }
  } catch (err) {
    throw err;
  }
}

async function readAll() {
  await ensureDataFile();
  const txt = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(txt || '[]');
}

async function writeAll(items) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

async function getAll() {
  return readAll();
}

async function getById(id) {
  const items = await readAll();
  return items.find((i) => i.id === id) || null;
}

async function createTask(obj) {
  const items = await readAll();
  items.push(obj);
  await writeAll(items);
  return obj;
}

async function updateTask(id, patch) {
  const items = await readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated = {
    ...items[idx],
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    ...(patch.scheduledAt !== undefined ? { scheduledAt: patch.scheduledAt } : {})
  };
  updated.updatedAt = new Date().toISOString();
  items[idx] = updated;
  await writeAll(items);
  return updated;
}

async function deleteTask(id) {
  const items = await readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  await writeAll(items);
  return true;
}

module.exports = {
  getAll,
  getById,
  createTask,
  updateTask,
  deleteTask
};
