import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
    />
  );
}

type CardSkeletonListProps = {
  count?: number;
};

export function CardSkeletonList({ count = 3 }: CardSkeletonListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="rounded-md border bg-expo-white p-4" key={index}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
