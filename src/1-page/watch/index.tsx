import { WatchWorkspace } from "@/src/2-widget";

import type { WatchProps } from "./type";

export default function Watch({ lesson }: WatchProps) {
  return <div className="watch"><WatchWorkspace key={lesson.id} lesson={lesson} /></div>;
}
