// Task Management Logic
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.sortBy = 'newest';
        this.searchQuery = '';

        this.init();
    }

    init() {
        // Initialize sample data if empty
        if (this.tasks.length === 0) {
            this.addSampleData();
        }

        this.cacheDOM();
        this.bindEvents();
        this.startClock();
        this.render();
    }

    startClock() {
        const update = () => {
            const now = new Date();
            const timeElement = document.getElementById('clock-time');
            const dateElement = document.getElementById('clock-date');

            if (timeElement) {
                timeElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            }
            if (dateElement) {
                dateElement.innerText = now.toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        };
        update();
        setInterval(update, 1000);
    }

    cacheDOM() {
        this.tasksList = document.getElementById('tasks-list');
        this.taskForm = document.getElementById('task-form');
        this.taskModal = document.getElementById('task-modal');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.pageTitle = document.getElementById('page-title');
        this.taskCount = document.getElementById('task-count');

        // Stats
        this.statPending = document.getElementById('stat-pending');
        this.statCompleted = document.getElementById('stat-completed');
        this.statEfficiency = document.getElementById('stat-efficiency');

        // Search & Filters
        this.searchInput = document.getElementById('task-search');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sort-select');
        this.navItems = document.querySelectorAll('.nav-item');
    }

    bindEvents() {
        // Modal Events
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtns.forEach(btn => btn.addEventListener('click', () => this.closeModal()));

        // Form Submission
        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // Filter Status
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.render();
        });

        // Nav Items (Sidebar)
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const type = item.id;
                if (type === 'btn-all-tasks') {
                    this.currentFilter = 'all';
                    this.currentCategory = 'all';
                    this.pageTitle.innerText = 'All Tasks';
                } else if (type === 'btn-completed') {
                    this.currentFilter = 'done';
                    this.pageTitle.innerText = 'Completed Tasks';
                } else if (type === 'btn-today') {
                    this.pageTitle.innerText = "Today's Tasks";
                    // Filter by date for today
                }
                this.render();
            });
        });

        // Drag and drop or other interactions can be added here
    }

    addSampleData() {
        const samples = [
            {
                id: Date.now() + 1,
                title: 'Design Dashboard UI',
                description: 'Create a modern, sleek dashboard using glassmorphism effects.',
                priority: 'high',
                dueDate: new Date().toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().getTime()
            },
            {
                id: Date.now() + 2,
                title: 'Implement Task Logic',
                description: 'Build the core task management logic using Vanilla JS.',
                priority: 'medium',
                dueDate: new Date().toISOString().split('T')[0],
                completed: true,
                createdAt: new Date().getTime() - 3600000
            },
            {
                id: Date.now() + 3,
                title: 'Buy Groceries',
                description: 'Coffee, Milk, and Bread.',
                priority: 'low',
                dueDate: new Date().toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().getTime() - 86400000
            }
        ];
        this.tasks = samples;
        this.saveTasks();
    }

    openModal(task = null) {
        this.taskModal.classList.add('active');
        if (task) {
            document.getElementById('modal-title').innerText = 'Edit Task';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-date').value = task.dueDate;
            this.taskForm.dataset.editingId = task.id;
        } else {
            document.getElementById('modal-title').innerText = 'Create New Task';
            this.taskForm.reset();
            delete this.taskForm.dataset.editingId;
            // Set default date to today
            document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
        }
    }

    closeModal() {
        this.taskModal.classList.remove('active');
    }

    handleTaskSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const priority = document.getElementById('task-priority').value;
        const dueDate = document.getElementById('task-date').value;
        const editingId = this.taskForm.dataset.editingId;

        if (editingId) {
            // Update existing
            const index = this.tasks.findIndex(t => t.id == editingId);
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    title,
                    description,
                    priority,
                    dueDate
                };
            }
        } else {
            // Add new
            const newTask = {
                id: Date.now(),
                title,
                description,
                priority,
                dueDate,
                completed: false,
                createdAt: new Date().getTime()
            };
            this.tasks.push(newTask);
        }

        this.saveTasks();
        this.render();
        this.closeModal();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    updateStats() {
        const pending = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        const efficiency = total === 0 ? 0 : Math.round((completed / total) * 100);

        this.statPending.innerText = pending;
        this.statCompleted.innerText = completed;
        this.statEfficiency.innerText = `${efficiency}%`;
        this.taskCount.innerText = `You have ${pending} tasks for today`;
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(this.searchQuery) ||
                t.description.toLowerCase().includes(this.searchQuery)
            );
        }

        // Status filter
        if (this.currentFilter === 'todo') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'done') {
            filtered = filtered.filter(t => t.completed);
        }

        // Sorting
        if (this.sortBy === 'newest') {
            filtered.sort((a, b) => b.createdAt - a.createdAt);
        } else if (this.sortBy === 'priority') {
            const priorityLevels = { high: 3, medium: 2, low: 1 };
            filtered.sort((a, b) => priorityLevels[b.priority] - priorityLevels[a.priority]);
        } else if (this.sortBy === 'due') {
            filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        }

        return filtered;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        this.tasksList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon glass-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h2>No tasks found</h2>
                    <p>Try changing your filters or add a new task.</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskEl.innerHTML = `
                    <div class="task-checkbox" onclick="taskManager.toggleTask(${task.id})">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="task-content">
                        <span class="task-title">${task.title}</span>
                        <div class="task-info">
                            <span><i class="far fa-calendar-alt"></i> ${task.dueDate || 'No date'}</span>
                            ${task.description ? `<span title="${task.description}"><i class="fas fa-info-circle"></i></span>` : ''}
                        </div>
                    </div>
                    <div class="priority-badge p-${task.priority}">${task.priority}</div>
                    <div class="task-actions">
                        <button class="icon-btn edit-btn" onclick="taskManager.openModal(${JSON.stringify(task).replace(/"/g, '&quot;')})">
                            <i class="far fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                this.tasksList.appendChild(taskEl);
            });
        }

        this.updateStats();
    }
}

// Initialize Global Task Manager
const taskManager = new TaskManager();

// Theme Toggle logic
const themeBtn = document.querySelector('.theme-toggle');
themeBtn.addEventListener('click', () => {
    const icon = themeBtn.querySelector('i');
    if (icon.classList.contains('fa-moon')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        document.documentElement.style.setProperty('--bg-dark', '#f8fafc');
        document.documentElement.style.setProperty('--text-main', '#0f172a');
        document.documentElement.style.setProperty('--surface', 'rgba(255, 255, 255, 0.7)');
        document.documentElement.style.setProperty('--border', 'rgba(0, 0, 0, 0.1)');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        document.documentElement.style.setProperty('--bg-dark', '#0f172a');
        document.documentElement.style.setProperty('--text-main', '#f8fafc');
        document.documentElement.style.setProperty('--surface', 'rgba(30, 41, 59, 0.7)');
        document.documentElement.style.setProperty('--border', 'rgba(255, 255, 255, 0.1)');
    }
});
