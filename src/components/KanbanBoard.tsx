import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ШАБЛОНЫ СТИЛЕЙ (Вынесены для идеальной читаемости JSX)
// ============================================================================
const STYLES = {
  page: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans",
  card: "w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6",
  
  // Шапка
  header: "flex items-center justify-between pb-4 border-b border-slate-800",
  title: "text-2xl font-bold tracking-wide text-slate-100 flex items-center gap-2",
  badge: "text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full",

  // Форма добавления
  form: "flex gap-2",
  input: "flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors",
  addBtn: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95",

  // Фильтры (с плавающей подложкой)
  filterContainer: "flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 justify-between gap-1 relative",
  filterBtn: "flex-1 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer text-center relative z-10 transition-colors duration-200",
  filterActiveText: "text-slate-950 font-bold",
  filterInactiveText: "text-slate-400 hover:text-slate-200",
  filterActiveBg: "absolute inset-0 bg-amber-500 rounded-xl z-0",

  // Список задач
  taskList: "flex flex-col gap-3 min-h-[200px]",
  taskItem: "flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 transition-colors",
  taskLeft: "flex items-center gap-3",
  checkbox: "w-5 h-5 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center cursor-pointer transition-colors hover:border-amber-500",
  checkboxChecked: "bg-amber-500 border-amber-500 text-slate-950 font-bold text-xs",
  taskText: "text-sm text-slate-200 font-medium",
  taskTextDone: "line-through text-slate-500",
  deleteBtn: "text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer text-base",

  // Пустое состояние
  emptyState: "text-center py-12 text-slate-500 text-sm font-mono"
};

// ============================================================================
// КОНФИГУРАЦИЯ АНИМАЦИЙ FRAMER MOTION
// ============================================================================
const ANIMATIONS = {
  // Анимация появления/удаления карточки задачи
  taskCard: {
    initial: { opacity: 0, y: 15, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -30, scale: 0.9, transition: { duration: 0.2 } },
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  },
  // Микро-отклик кнопок
  buttonTap: {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 }
  }
} as const;

// ============================================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================================================
type FilterStatus = 'all' | 'active' | 'completed';

interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
}

/* (ре)рендер происходит только внутри компонента...
...и только там переменные пересоздаются */
const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Разобрать `AnimatePresence` во Framer Motion', isCompleted: true },
  { id: '2', text: 'Изучить работу с `layoutId` для плашек', isCompleted: false },
  { id: '3', text: 'Собрать минималистичную доску задач', isCompleted: false },
];

const FILTERS: FilterStatus[] = ['all', 'active', 'completed'];

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================================
export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [newTaskText, setNewTaskText] = useState('');

  // Добавление задачи
  const handleAddTask = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      isCompleted: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText('');
  };

  // Переключение состояния
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  // Удаление задачи
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Фильтрация
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className={STYLES.page}>
      <div className={STYLES.card}>
        
        {/* Шапка */}
        <div className={STYLES.header}>
          <h1 className={STYLES.title}>
            <span>📋</span> TASK BOARD
          </h1>
          <span className={STYLES.badge}>
            {tasks.filter((t) => !t.isCompleted).length} осталось
          </span>
        </div>

        {/* Форма добавления */}
        <form onSubmit={handleAddTask} className={STYLES.form}>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Что нужно сделать?"
            className={STYLES.input}
          />
          <motion.button
            type="submit"
            className={STYLES.addBtn}
            /* Spread Operator даже здесь функционален...
            ...для обработок событий */
            {...ANIMATIONS.buttonTap}
          >
            Добавить
          </motion.button>
        </form>

        {/* Переключатель фильтров с layoutId */}
        <div className={STYLES.filterContainer}>
          {FILTERS.map((f) => {
            const isActive = filter === f;
            const labels: Record<FilterStatus, string> = {
              all: 'Все',
              active: 'В работе',
              completed: 'Готово',
            };

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${STYLES.filterBtn} ${
                  isActive ? STYLES.filterActiveText : STYLES.filterInactiveText
                }`}
              >
                {/* Плавающая фоновая плашка...
                ...layoutId устанавливает связь между активируемыми между собой элементами motion.div...
                ...framer-motion по дефолту понимает, какую анимацию выполнять */}
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    className={STYLES.filterActiveBg}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{labels[f]}</span>
              </button>
            );
          })}
        </div>

        {/* Анимированный список задач */}
        <div className={STYLES.taskList}>
            {/* Этот элемент из framer-motion позволяет при удалении доч элемента-анимации...
            ...визуально не удалять его сразу, чтобы проиграть анимацию в exit...
            ...все дочерние элементы-аниматоры при этом должны быть с ключом */}
            {/* popLayout решает задачу одновременных анимаций при удалении элемента внутри */}
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  /* layout плавно смещает элемент при перерисовке и изменении положения */
                  layout
                  {...ANIMATIONS.taskCard}
                  className={STYLES.taskItem}
                >
                  <div className={STYLES.taskLeft}>
                    <div
                      onClick={() => toggleTask(task.id)}
                      className={`${STYLES.checkbox} ${
                        task.isCompleted ? STYLES.checkboxChecked : ''
                      }`}
                    >
                      {task.isCompleted && '✓'}
                    </div>
                    <span
                      className={`${STYLES.taskText} ${
                        task.isCompleted ? STYLES.taskTextDone : ''
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className={STYLES.deleteBtn}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
              /* Шаблон здесь - тонкая деталь для анимации между пустыми списками */
                key={`empty-${filter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={STYLES.emptyState}
              >
                Задач в этой категории нет ☕
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default KanbanBoard;