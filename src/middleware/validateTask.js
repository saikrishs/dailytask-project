function validateCreate(req, res, next) {
  const { title, notes, scheduledAt } = req.body || {};
  const errors = [];
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required and must be a non-empty string');
  }
  if (title && title.length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }
  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string');
  }
  if (scheduledAt !== undefined) {
    if (typeof scheduledAt !== 'string') {
      errors.push('scheduledAt must be an ISO datetime string');
    } else {
      const d = new Date(scheduledAt);
      if (Number.isNaN(d.getTime())) errors.push('scheduledAt must be a valid datetime');
    }
  }
  if (errors.length) return res.status(400).json({ errors });
  req.body.title = title.trim();
  if (scheduledAt) req.body.scheduledAt = new Date(scheduledAt).toISOString();
  next();
}

function validateUpdate(req, res, next) {
  const { title, notes, scheduledAt } = req.body || {};
  const errors = [];
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.push('Title must be a non-empty string when provided');
    } else if (title.length > 200) {
      errors.push('Title must be 200 characters or fewer');
    }
  }
  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string when provided');
  }
  if (scheduledAt !== undefined) {
    if (typeof scheduledAt !== 'string') {
      errors.push('scheduledAt must be an ISO datetime string when provided');
    } else {
      const d = new Date(scheduledAt);
      if (Number.isNaN(d.getTime())) errors.push('scheduledAt must be a valid datetime');
    }
  }
  if (errors.length) return res.status(400).json({ errors });
  if (title) req.body.title = title.trim();
  if (scheduledAt) req.body.scheduledAt = new Date(scheduledAt).toISOString();
  next();
}

module.exports = { validateCreate, validateUpdate };
