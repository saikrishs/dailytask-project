const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../storage/dbStore');
const { validateCreate, validateUpdate } = require('../middleware/validateTask');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const tasks = await store.getAll();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await store.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/history', async (req, res, next) => {
  try {
    const history = await store.getTaskHistory(req.params.id);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

router.post('/', validateCreate, async (req, res, next) => {
  try {
    const { title, notes, scheduledAt } = req.body;
    const newTask = {
      id: uuidv4(),
      title: title,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    if (scheduledAt) newTask.scheduledAt = scheduledAt;
    await store.createTask(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateUpdate, async (req, res, next) => {
  try {
    const { title, notes, scheduledAt } = req.body;
    const patch = { title, notes };
    if (scheduledAt !== undefined) patch.scheduledAt = scheduledAt;
    const updated = await store.updateTask(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await store.deleteTask(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/history/all', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const history = await store.getAllHistory(limit, offset);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
