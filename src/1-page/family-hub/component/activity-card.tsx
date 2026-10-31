import type { ActivityCardProps } from "../type";

export function ActivityCard({ activity, onOpen }: ActivityCardProps) {
  return <button className="activity-card" onClick={() => onOpen(activity)}><span className="activity-icon">{activity.icon}</span><span className="activity-theme">{activity.theme} · {activity.scene}</span><strong>{activity.title}</strong><span className="activity-phrase">“{activity.phrase}”</span><span className="activity-more">놀이 방법 보기 ↗</span></button>;
}
