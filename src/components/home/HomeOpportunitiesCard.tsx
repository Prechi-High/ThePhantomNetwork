"use client";

const TASKS = [
  { label: "Join 2 Sessions", progress: 1, max: 2, reward: "500 Tokens" },
  { label: "Win 1 Session", progress: 0, max: 1, reward: "+Influence" },
  { label: "Spin the Wheel", progress: 1, max: 1, reward: "Claimed", claimed: true },
];

export function HomeOpportunitiesCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-3">
      <p className="mb-2 text-[9px] font-bold uppercase text-white/50">Today&apos;s Opportunities</p>
      <ul className="space-y-2">
        {TASKS.map((task) => (
          <li key={task.label}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/80">{task.label}</span>
              <span className={task.claimed ? "text-emerald-400" : "text-[#f5b942]"}>
                {task.reward}
              </span>
            </div>
            {!task.claimed && (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(task.progress / task.max) * 100}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
