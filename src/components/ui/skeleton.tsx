import { cn } from "@/lib/cn"

/** The placeholder shown while data is on its way.
 *
 *  Deliberately neutral, not the brand accent: a screen full of blue (or
 *  orange, on the site) blocks reads as content rather than as waiting. A
 *  soft grey recedes, which is the whole point of a loading state. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-black/[0.07] dark:bg-white/[0.09]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
