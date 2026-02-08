import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { BadgeMap } from './TressureMap';
import { MilestoneProgress } from './MilestoneProgress';


export function AchievementsTab() {
  return (
    <div className="space-y-6">
      <Card className="border-[#23B685]/20">
        <CardHeader>
          <CardTitle className="text-[#243E36] flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeMap/>
          <MilestoneProgress/>
        </CardContent>
      </Card>
    </div>
  );
}