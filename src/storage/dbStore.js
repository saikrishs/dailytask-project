const { getDatabase } = require('./database');

async function getAll() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');
  return stmt.all();
}

async function getById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id) || null;
}

async function createTask(obj) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, notes, scheduledAt, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(obj.id, obj.title, obj.notes || '', obj.scheduledAt || null, obj.createdAt);
  
  // Log to history
  const historyStmt = db.prepare(`
    INSERT INTO task_history (task_id, action, timestamp, changes)
    VALUES (?, ?, ?, ?)
  `);
  
  historyStmt.run(
    obj.id,
    'CREATE',
    new Date().toISOString(),
    JSON.stringify({ title: obj.title, notes: obj.notes, scheduledAt: obj.scheduledAt })
  );
  
  return obj;
}

async function updateTask(id, patch) {
  const db = getDatabase();
  
  // Get current task
  const currentTask = await getById(id);
  if (!currentTask) return null;
  
  // Prepare update
  const updates = [];
  const values = [];
  if (patch.title !== undefined) {
    updates.push('title = ?');
    values.push(patch.title);
  }
  if (patch.notes !== undefined) {
    updates.push('notes = ?');
    values.push(patch.notes);
  }
  if (patch.scheduledAt !== undefined) {
    updates.push('scheduledAt = ?');
    values.push(patch.scheduledAt);
  }
  
  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  
  // Log to history
  const historyStmt = db.prepare(`
    INSERT INTO task_history (task_id, action, timestamp, changes)
    VALUES (?, ?, ?, ?)
  `);
  
  historyStmt.run(
    id,
    'UPDATE',
    new Date().toISOString(),
    JSON.stringify(patch)
  );
  
  const updated = await getById(id);
  return updated;
}

async function deleteTask(id) {
  const db = getDatabase();
  
  // Get task before deletion
  const task = await getById(id);
  if (!task) return false;
  
  // Log to history before deletion
  const historyStmt = db.prepare(`
    INSERT INTO task_history (task_id, action, timestamp, changes)
    VALUES (?, ?, ?, ?)
  `);
  
  historyStmt.run(
    id,
    'DELETE',
    new Date().toISOString(),
    JSON.stringify(task)
  );
  
  // Delete task
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}

async function getTaskHistory(taskId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, task_id, action, timestamp, changes
    FROM task_history
    WHERE task_id = ?
    ORDER BY timestamp DESC
  `);
  
  const history = stmt.all(taskId);
  return history.map(entry => ({
    ...entry,
    changes: entry.changes ? JSON.parse(entry.changes) : null
  }));
}

async function getAllHistory(limit = 100, offset = 0) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, task_id, action, timestamp, changes
    FROM task_history
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `);
  
  const history = stmt.all(limit, offset);
  return history.map(entry => ({
    ...entry,
    changes: entry.changes ? JSON.parse(entry.changes) : null
  }));
}

module.exports = {
  getAll,
  getById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory,
  getAllHistory
};
