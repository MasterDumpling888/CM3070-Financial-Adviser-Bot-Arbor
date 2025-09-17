"use client"

import { InfoPopup } from "@/components/ui/info-popup";
import { Response } from "@/components/ai-elements/response";

interface FinancialTermPart {
  text: string;
  isTerm: boolean;
  definition?: string;
}

interface FinancialTermProps {
  parts: FinancialTermPart[];
}

export function FinancialTerm({ parts }: FinancialTermProps) {
  if (!parts || !Array.isArray(parts)) {
    return null;
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.isTerm) {
          return (
            <InfoPopup key={i} term={part.text} definition={part.definition || ""}>
              <span className="underline decoration-dotted cursor-pointer">{part.text}</span>
            </InfoPopup>
          );
        }
        return <Response key={i}>{part.text}</Response>;
      })}
    </>
  );
}
