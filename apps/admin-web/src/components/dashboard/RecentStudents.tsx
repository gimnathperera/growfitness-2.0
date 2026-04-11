import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiQuery } from '@/hooks/useApiQuery';
import { kidsService } from '@/services/kids.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Baby, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Kid } from '@grow-fitness/shared-types';

export function RecentStudents() {
  const navigate = useNavigate();
  const { data, isLoading } = useApiQuery(['kids', 'recent'], () =>
    kidsService.getKids(1, 5)
  );

  const students = data?.data || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Students</CardTitle>
        <button
          onClick={() => navigate('/kids')}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Baby className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No students yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((kid: Kid) => (
              <div
                key={kid.id}
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => navigate(`/kids?kidId=${kid.id}&modal=details`)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {kid.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {kid.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {kid.gender} • {kid.sessionType}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
