'use client'

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface ChartConfigItem {
  label: string;
  color: string;
}

interface CustomChartConfig {
  close: ChartConfigItem;
  open: ChartConfigItem;
}

const chartConfig: CustomChartConfig = {
  close: {
    label: "Close",
    color: "var(--chart-1)",
  },
  open: {
    label: "Open",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig

interface ChartAreaGradientProps {
  ticker?: string;
  data?: ChartDataItem[];
}

interface ChartDataItem {
  month: string;
  close: number;
  open: number;
}

export function ChartAreaGradient({ ticker, data: initialData }: ChartAreaGradientProps) {
  const [chartData, setChartData] = useState<ChartDataItem[] | undefined>(initialData);
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    if (!initialData && ticker) {
      fetch(`http://localhost:8000/historical-data/${ticker}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedData = data.map(d => ({ month: d.date.substring(0, 10), close: d.close, open: d.open }));
          setChartData(formattedData);

          if (formattedData.length > 0) {
            const firstDataPoint = formattedData[0];
            const lastDataPoint = formattedData[formattedData.length - 1];
            const firstPrice = firstDataPoint.close;
            const lastPrice = lastDataPoint.close;
            const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;

            const firstDate = new Date(firstDataPoint.month);
            const lastDate = new Date(lastDataPoint.month);

            setFooterData({
              percentageChange: percentageChange.toFixed(2),
              trendingUp: percentageChange >= 0,
              timePeriod: `${firstDate.toLocaleString('default', { month: 'short' })} ${firstDate.getFullYear()} - ${lastDate.toLocaleString('default', { month: 'short' })} ${lastDate.getFullYear()}`
            });
          }
        });
    }
  }, [initialData, ticker]);

  if (!chartData) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="card">
      <CardHeader className="card-header">
        <CardTitle className="card-title">{ticker}&apos;s Performance</CardTitle>
        <CardDescription className="card-description">
          Here&apos;s the performance of {ticker}
        </CardDescription>
      </CardHeader>
      <CardContent className="card-content">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleString('default', { month: 'short', day: 'numeric' });
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-open)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-open)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-close)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-close)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="open"
              type="natural"
              fill="url(#fillOpen)"
              fillOpacity={0.4}
              stroke="var(--color-open)"
              stackId="a"
            />
            <Area
              dataKey="close"
              type="natural"
              fill="url(#fillClose)"
              fillOpacity={0.4}
              stroke="var(--color-close)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {footerData && (
        <CardFooter className="card-footer">
          <div className="flex w-full items-start gap-2">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none">
                {footerData.trendingUp ? (
                  <TrendingUp className="h-4 w-4 text-positive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-negative" />
                )}
                Trending {footerData.trendingUp ? "up" : "down"} by {footerData.percentageChange}% this period
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {footerData.timePeriod}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}