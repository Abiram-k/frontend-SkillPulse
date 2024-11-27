import { Skeleton } from "@/Components/ui/skeleton"
 
export function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4  h-fit">
      {/* <Skeleton className="h-16 w-16 rounded-full bg-gray-500" /> */}
      <div className="space-y-2 flex flex-col justify-center align-middle ">
        <Skeleton className="h-10 w-[650px] bg-gray-500 " />
        <Skeleton className="h-10 w-[650px] bg-gray-500" />
      </div>
    </div>
  )
}