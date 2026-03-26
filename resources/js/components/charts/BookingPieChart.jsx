import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function BookingPieChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 font-display text-sm">Booking by Platform</h3>
        <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color}/>
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }}/>
                {item.name}
              </span>
              <span className="font-semibold text-gray-700">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
