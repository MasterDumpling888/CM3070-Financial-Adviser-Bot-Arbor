"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { Button, ButtonProps } from "./button"

interface TooltipButtonProps extends ButtonProps {
  tooltipContent: React.ReactNode
}

function TooltipButton({ tooltipContent, children, ...props }: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  )
}

export { TooltipButton }
