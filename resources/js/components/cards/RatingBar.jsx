export default function RatingBar({ name, score }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-gray-500 w-20 flex-shrink-0">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#A8D5A2] rounded-full transition-all duration-700"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="text-gray-700 font-semibold w-6 text-right">{score}</span>
    </div>
  );
}
