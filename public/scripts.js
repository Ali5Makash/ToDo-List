document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    // Загрузка задач с сервера
    const loadTasks = async () => {
        try {
            const response = await fetch('/tasks');
            const data = await response.json();
            data.tasks.forEach(task => {
                addTaskToList(task);
            });
        } catch (err) {
            console.error('Error loading tasks:', err);
        }
    };

    // Сохранение задач на сервер
    const saveTask = async (task) => {
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task })
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error saving task:', err);
        }
    };

    // Удаление задачи с сервера
    const deleteTask = async (id) => {
        try {
            await fetch(`/tasks/${id}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    // Обновление задачи на сервере
    const updateTask = async (id, completed) => {
        try {
            await fetch(`/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            });
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    // Добавление задачи в список
    const addTaskToList = (task) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', async () => {
            await updateTask(task.id, checkbox.checked);
        });

        const taskText = document.createElement('span');
        taskText.textContent = task.task;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', async () => {
            await deleteTask(task.id);
            li.remove();
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    };

    // Обработка добавления новой задачи
    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const task = taskInput.value.trim();
        if (task) {
            const data = await saveTask(task);
            if (data) {
                addTaskToList(data);
                taskInput.value = '';
            }
        }
    });

    loadTasks();
});
