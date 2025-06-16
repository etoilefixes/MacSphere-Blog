
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle } from "lucide-react";

// Mock data removed. Charts will be empty or show "no data" message.
// Real data would come from a backend analytics service.
const pieData: { region: string; visitors: number; fill: string }[] = [];

const pieChartConfig = {
  visitors: {
    label: "访客数",
  },
  // Default chart colors for legend if data is empty or structure changes
  "华东地区": { label: "华东地区", color: "hsl(var(--chart-1))" },
  "华南地区": { label: "华南地区", color: "hsl(var(--chart-2))" },
  "华北地区": { label: "华北地区", color: "hsl(var(--chart-3))" },
  "西南地区": { label: "西南地区", color: "hsl(var(--chart-4))" },
  "其他地区": { label: "其他地区", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


const provinceVisitData: { name: string; visits: number; fill: string }[] = [];

const provinceBarChartConfig = {
  visits: {
    label: "访客数",
    color: "hsl(0, 70%, 50%)", 
  },
} satisfies ChartConfig;


export default function AdminAnalyticsPage() {
  const noDataMessage = (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <AlertTriangle className="w-12 h-12 mb-4 text-orange-400" />
        <p className="text-lg font-semibold">暂无分析数据</p>
        <p className="text-sm">连接后端分析服务后，此处将显示图表。</p>
    </div>
  );

  return (
    <div className="container mx-auto py-8 animate-genie-in">
      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">网站分析</CardTitle>
          <CardDescription>以下图表将展示网站访问数据（需要后端集成）。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-md min-h-[400px]"> {/* Added min-height for consistency */}
              <CardHeader>
                <CardTitle className="text-xl font-headline">访客来源地区分布 (大区)</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]"> {/* Explicit height for chart container */}
                {pieData.length === 0 ? noDataMessage : (
                    <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[350px]">
                    <PieChart>
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="visitors" />}
                        />
                        <Pie
                        data={pieData}
                        dataKey="visitors"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                        {pieData.map((entry) => (
                            <Cell key={`cell-${entry.region}`} fill={entry.fill} className="stroke-background focus:outline-none" />
                        ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="region" />} />
                    </PieChart>
                    </ChartContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-md min-h-[400px]"> {/* Added min-height */}
              <CardHeader>
                <CardTitle className="text-xl font-headline">各省份访问量排行</CardTitle>
              </CardHeader>
              <CardContent className="pl-0 h-[400px]"> {/* Explicit height for chart container */}
                 {provinceVisitData.length === 0 ? noDataMessage : (
                    <ChartContainer config={provinceBarChartConfig} className="h-full w-full">
                    <BarChart data={provinceVisitData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 20 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="visits" />
                        <YAxis type="category" dataKey="name" width={60} interval={0} stroke="hsl(var(--foreground))" tick={{fontSize: 12}} />
                        <ChartTooltip 
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                        content={<ChartTooltipContent />} 
                        />
                        <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                        {provinceVisitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ChartContainer>
                 )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline">关于中国省份访客地图</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-sm">
              <p>动态的、数据驱动的省份热力图是强大的可视化工具，但其实现涉及以下方面：</p>
              <ul>
                <li>精确的中国省份地理边界数据（如 GeoJSON 格式）。</li>
                <li>专门的地图渲染库（如 D3.js, ECharts, Leaflet 等）来处理地理数据和交互。</li>
                <li>真实的访客数据收集和 IP 地址到地理位置的转换，需要后端支持和数据分析服务。</li>
              </ul>
              <p>
                目前，上方的“各省份访问量排行”条形图旨在提供一种替代方案。待后端分析服务集成后，图表将展示真实数据。
              </p>
              <p>未来，在引入地图库和后端地理位置服务后，可以进一步实现交互式地理热力图。</p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
       <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-700 dark:text-blue-200">
          <strong>重要提示：</strong> 此分析页面需要与后端数据分析服务集成才能显示真实数据。
      </div>
    </div>
  );
}
