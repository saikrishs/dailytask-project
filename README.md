# Daily Task Notes

Simple Express + Node.js project to store daily task notes in a local JSON file.

## Setup

Install dependencies:

```bash
npm install
```

Run in development (requires `nodemon`):

```bash
npm run dev
```

Run production:

```bash
npm start
```

## API Endpoints

- `GET /tasks` — list all tasks
- `GET /tasks/:id` — get a task
- `POST /tasks` — create task `{ "title": "...", "notes": "..." }`
- `PUT /tasks/:id` — update task
- `DELETE /tasks/:id` — remove task

Data is stored in `data/tasks.json`.
