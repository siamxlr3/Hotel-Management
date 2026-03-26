const colorMap = {
  green:  { bg: 'bg-green-100',  text: 'text-green-600',  dot: 'bg-green-400'  },
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-400'   },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-400' },
};

export default function RecentActivities({ activities }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 font-display text-sm">Recent Activities</h3>
        <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
      </div>
      <div className="flex flex-col gap-4">
        {activities.map(item => {
          const c = colorMap[item.color];
          return (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {item.title[0]}
                </div>
                <div className="w-px flex-1 bg-gray-100 mt-1"/>
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 mb-0.5">{item.time}</p>
                <p className="text-xs font-semibold text-gray-800 mb-0.5">{item.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
