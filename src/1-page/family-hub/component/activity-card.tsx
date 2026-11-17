import type { ActivityCardProps } from "../type";

export function ActivityCard({ activity, onOpen }: ActivityCardProps) {
  return <button className="activity-card" onClick={() => onOpen(activity)}><span className="activity-icon">{activity.icon}</span><span className="activity-theme">{activity.theme} · {activity.scene}</span><strong>{activity.title}</strong><span className="activity-phrase">“{activity.phrase}”</span><span className="activity-more">이 주제로 AI와 대화 →</span></button>;
}
