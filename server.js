const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Подключение базы данных
const db = new sqlite3.Database(':memory:'); // Временная база данных в памяти

// Создание таблицы для хранения задач
db.serialize(() => {
    db.run('CREATE TABLE tasks (id INTEGER PRIMARY KEY, task TEXT, completed BOOLEAN)');
});

// Middleware для парсинга JSON
app.use(express.json());

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения всех задач
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tasks: rows });
    });
});

// Маршрут для добавления новой задачи
app.post('/tasks', (req, res) => {
    const { task } = req.body;
    if (!task) {
        res.status(400).json({ error: 'Task is required' });
        return;
    }
    db.run('INSERT INTO tasks (task, completed) VALUES (?, ?)', [task, false], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, task, completed: false });
    });
});

// Маршрут для удаления задачи
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(204).end();
    });
});

// Маршрут для обновления задачи
app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(204).end();
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
