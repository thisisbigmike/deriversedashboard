'use client';

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store';
import { useMetrics } from '@/hooks/useMetrics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PnLChart } from '@/components/charts/PnLChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { HeatmapChart } from '@/components/charts/HeatmapChart';

export default function AnalyticsPage() {
  const isLoading = useDashboardStore((s) => s.isLoading);
  const { dailyPnL, volumeData, heatmapData } = useMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[300px] bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px] bg-white/5 rounded-xl" />
          <div className="h-[300px] bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Heatmap (by Day & Hour)</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart data={heatmapData} />
          </CardContent>
        </Card>

        {/* PnL Chart */}
        <Card>
          <CardHeader>
            <CardTitle>PnL Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px]">
            <PnLChart data={dailyPnL} showDrawdown={false} />
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Volume Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] sm:h-[300px]">
            <VolumeChart data={volumeData} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
