class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.setupEventListeners();
        this.updateUI();
        this.initializeTheme();
    }

    initializeTheme() {
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle').textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('.theme-toggle').textContent = '🌙';
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Filter changes
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterTasks());
    }

    addTask() {
        const form = document.getElementById('taskForm');
        const editingTaskId = form.dataset.editingTaskId;
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            completed: editingTaskId ? this.tasks.find(t => t.id === Number(editingTaskId))?.completed || false : false,
            id: editingTaskId ? Number(editingTaskId) : Date.now()
        };

        if (editingTaskId) {
            const index = this.tasks.findIndex(t => t.id === Number(editingTaskId));
            if (index !== -1) {
                this.tasks[index] = taskData;
            }
            // Limpar modo de edição
            delete form.dataset.editingTaskId;
        } else {
            this.tasks.push(taskData);
        }

        this.saveTasks();
        this.updateUI();
        form.reset();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const form = document.getElementById('taskForm');
        
        // Preencher o formulário com os dados da tarefa
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate;

        // Marcar o formulário como editando
        form.dataset.editingTaskId = taskId;
        
        // Rolar até o formulário
        form.scrollIntoView({ behavior: 'smooth' });
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.updateUI();
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateUI();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle').textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('.theme-toggle').textContent = '🌙';
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        let filteredTasks = [...this.tasks];

        if (categoryFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
        }
        if (priorityFilter !== 'All') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        this.renderTasks(filteredTasks);
    }

    updateUI() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = this.tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <div class="task-header">
                        <h3>${task.title}</h3>
                    </div>
                    <p>${task.description}</p>
                    <div class="task-metadata">
                        <span class="task-category">🏷️ ${task.category}</span>
                        <span class="task-priority">🎯 ${task.priority}</span>
                        <span class="task-date">📅 ${task.dueDate}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="taskManager.toggleTaskStatus(${task.id})">
                        ${task.completed ? '✅' : '⭕'} ${task.completed ? 'Concluída' : 'Concluir'}
                    </button>
                    <button class="edit-btn" onclick="taskManager.editTask(${task.id})">
                        ✏️ Editar
                    </button>
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">
                        🗑️ Deletar
                    </button>
                </div>
            </div>
        `).join('');

        this.updateStats();
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateStats();
        }
    }

    updateStats() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'High').length;

        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
    }

    updateFilters() {
        const categories = ['All', ...new Set(this.tasks.map(task => task.category))];
        const priorities = ['All', ...new Set(this.tasks.map(task => task.priority))];

        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');

        priorityFilter.innerHTML = priorities.map(priority => 
            `<option value="${priority}">${priority}</option>`
        ).join('');
    }

    renderTasks(tasksToRender) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        tasksToRender.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.category.toLowerCase().replace(' ', '-')} ${task.completed ? 'completed' : ''}`;
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-category ${task.category.toLowerCase().replace(' ', '-')}">${task.category}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span>Due in ${this.calculateDueDate(task.dueDate)}</span>
                    <div class="task-actions">
                        <button onclick="taskManager.toggleTaskCompletion(${task.id})">
                            ${task.completed ? '↩️' : '✓'}
                        </button>
                        <button onclick="taskManager.deleteTask(${task.id})">🗑️</button>
                    </div>
                </div>
            `;
            
            tasksList.appendChild(taskElement);
        });
    }

    calculateDueDate(dueDate) {
        const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return '1 day';
        return `${days} days`;
    }
}

// Initialize the task manager
const taskManager = new TaskManager();

document.addEventListener("DOMContentLoaded", () => {
    const tasksList = document.getElementById("tasksList");

    // Exemplo de evento para o botão "Editar"
    tasksList.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-task-btn")) {
            const taskCard = e.target.closest(".task-card");
            const taskTitle = taskCard.querySelector(".task-title").textContent;
            const taskDescription = taskCard.querySelector(".task-description").textContent;
            const taskCategory = taskCard.querySelector(".task-category").textContent.split(": ")[1];
            const taskPriority = taskCard.querySelector(".task-priority").textContent.split(": ")[1];

            // Preencher o formulário de edição com os dados da tarefa
            document.getElementById("taskTitle").value = taskTitle;
            document.getElementById("taskDescription").value = taskDescription;
            document.getElementById("taskCategory").value = taskCategory;
            document.getElementById("taskPriority").value = taskPriority;

            // Exibir o formulário de edição
            document.getElementById("taskForm").dataset.editing = "true";
            document.getElementById("taskForm").dataset.taskId = taskCard.dataset.taskId;
        }
    });

    // Salvar alterações no formulário
    document.getElementById("taskForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const isEditing = e.target.dataset.editing === "true";
        if (isEditing) {
            const taskId = e.target.dataset.taskId;
            const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);

            // Atualizar os dados da tarefa
            taskCard.querySelector(".task-title").textContent = document.getElementById("taskTitle").value;
            taskCard.querySelector(".task-description").textContent = document.getElementById("taskDescription").value;
            taskCard.querySelector(".task-category").textContent = `Categoria: ${document.getElementById("taskCategory").value}`;
            taskCard.querySelector(".task-priority").textContent = `Prioridade: ${document.getElementById("taskPriority").value}`;

            // Resetar o formulário
            e.target.reset();
            delete e.target.dataset.editing;
            delete e.target.dataset.taskId;
        }
    });
});
