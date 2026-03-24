import { Skeleton } from "@/components/ui/skeleton";

export default function CardsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mx-auto h-48 w-72 rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>
  );
}
