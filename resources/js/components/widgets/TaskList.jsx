import { useDashboardData } from '../../hooks/useDashboard';

export default function TaskList() {
  const { tasks, completeTask } = useDashboardData();
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 font-display text-sm">Tasks</h3>
        <button className="w-7 h-7 rounded-lg bg-[#A8D5A2] flex items-center justify-center text-[#1A2E1B] font-bold text-lg hover:bg-[#8DC888] transition-colors">
          +
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
              task.highlight
                ? 'bg-[#F0FAE8] border-[#C8E6B8]'
                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
            } ${task.done ? 'opacity-50' : ''}`}
            onClick={() => completeTask(task.id)}
          >
            <p className="text-[10px] text-gray-400 mb-1">{task.date}</p>
            <div className="flex items-start gap-2">
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                task.done ? 'bg-[#A8D5A2] border-[#A8D5A2]' : 'border-gray-300'
              }`}>
                {task.done && <span className="text-white text-[8px] font-bold">✓</span>}
              </div>
              <p className={`text-xs leading-relaxed ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
