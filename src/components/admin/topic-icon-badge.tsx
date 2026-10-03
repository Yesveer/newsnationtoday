import { SafeImage as Image } from "@/components/ui/safe-image";
import { IconFlame } from "@tabler/icons-react";
import { stateMapPaths } from "@/config/state-maps";
import { toneTileStyle } from "@/lib/admin/tone";
import { topicIcons } from "@/components/topics/topic-icon";
import type { Topic } from "@/config/topics.config";

/** Same badge the public topic explorer uses: state outline, then vector icon,
 *  then flag — so the portal shows exactly what a reader will see. */
export function TopicIconBadge({ topic }: { topic: Topic }) {
  const mapPath = stateMapPaths[topic.slug];
  const Icon = topicIcons[topic.slug];

  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
      style={toneTileStyle()}
    >
      {topic.iconUrl ? (
        <Image src={topic.iconUrl} alt="" width={24} height={24} className="size-6 object-contain" unoptimized />
      ) : mapPath ? (
        <svg viewBox="0 0 100 100" className="size-6" fill="currentColor" aria-hidden>
          <path d={mapPath} />
        </svg>
      ) : Icon ? (
        <Icon className="size-5" stroke={1.7} />
      ) : topic.badge ? (
        <span className="text-lg leading-none">{topic.badge}</span>
      ) : (
        <IconFlame className="size-5" stroke={1.7} />
      )}
    </span>
  );
}
