import { Badge } from "@/Components/ui/badge.jsx";

export function BadgeDemo({ quantity }) {
  return (
    <Badge
      className={
        "absolute right-0 left-3 rounded-full  bg-red-500 text-white font-thin font-mono bottom-4  w-1 flex justify-center h-5"
      }
    >
      {quantity}
    </Badge>
  );
}
