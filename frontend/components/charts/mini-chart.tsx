'use client';

import { Area, AreaChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";

const chartConfig = {
  close: {
    color: "var(--chart-1)",
  },
};

export function MiniChart({ ticker }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (ticker) {
      fetch(`http://localhost:8000/historical-data/${ticker}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedData = data.map(d => ({ close: d.close }));
          setChartData(formattedData);
        });
    }
  }, [ticker]);

  if (!chartData) {
    return null; // Or a loader
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-full bg-gray-100 rounded-lg shadow-inner">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillCloseMini" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="close"
          type="natural"
          fill="url(#fillCloseMini)"
          fillOpacity={0.4}
          stroke="var(--color-close)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
