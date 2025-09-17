
"use client"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface InfoPopupProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function InfoPopup({ term, definition, children }: InfoPopupProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{term}</h4>
            <p className="text-sm">
              {definition}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
