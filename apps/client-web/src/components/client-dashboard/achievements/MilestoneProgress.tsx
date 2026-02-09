import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

type Category = 'Fitness' | 'Wellness' | 'Nutrition';

type Task = {
  id: string;
  name: string;
  category: Category;
  completed: boolean;
  assignedByCoach: boolean;
};

type Milestone = {
  id: string;
  title: string;
  tasks: Task[];
};

export function MilestoneProgress() {
  // Generate 12 milestones dynamically
  const initialMilestones: Milestone[] = Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Milestone ${i + 1}`,
    tasks: [
      {
        id: `f-${i + 1}`,
        name: 'Fitness Task',
        category: 'Fitness',
        completed: false,
        assignedByCoach: true,
      },
      {
        id: `w-${i + 1}`,
        name: 'Wellness Task',
        category: 'Wellness',
        completed: false,
        assignedByCoach: true,
      },
      {
        id: `n-${i + 1}`,
        name: 'Nutrition Task',
        category: 'Nutrition',
        completed: false,
        assignedByCoach: true,
      },
    ],
  }));

  const [milestones, setMilestones] = useState(initialMilestones);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const toggleTask = (milestoneId: string, taskId: string, category: Category) => {
    // Only allow updates for Wellness and Nutrition
    if (category === 'Fitness') return;

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              tasks: m.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : m
      )
    );
  };

  const milestoneCompleted = (tasks: Task[]) => tasks.every((t) => t.completed);

  const handleSaveProgress = (milestoneId: string) => {
    const ms = milestones.find((m) => m.id === milestoneId);
    if (!ms) return;
    // TODO: Implement save progress functionality
    // const payload = ms.tasks
    //   .filter((t) => t.category !== 'Fitness')
    //   .map((t) => ({ id: t.id, completed: t.completed, category: t.category }));
  };

  return (
    <div className="space-y-6 mt-10">
      <Card className="border-[#23B685]/20">
        <CardHeader>
          <CardTitle className="text-[#243E36] flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Progress Milestones
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {milestones.map((milestone) => {
            const completed = milestoneCompleted(milestone.tasks);
            const isExpanded = expanded === milestone.id;

            return (
              <div
                key={milestone.id}
                className="border rounded-lg p-3 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleExpand(milestone.id)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#23B685]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#23B685]" />
                    )}
                    <span
                      className={`font-semibold ${
                        completed ? 'text-[#23B685]' : 'text-gray-700'
                      }`}
                    >
                      {milestone.title}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      completed ? 'text-[#23B685]' : 'text-gray-500'
                    }`}
                  >
                    {completed ? '✅ Completed' : 'In Progress'}
                  </span>
                </button>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 pl-8">
                    {milestone.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() =>
                              toggleTask(milestone.id, task.id, task.category)
                            }
                            disabled={task.category === 'Fitness'}
                            className="!border-[#23B685]/50 data-[state=checked]:!bg-[#23B685] 
                                       data-[state=checked]:!border-[#23B685] data-[state=checked]:!text-white"
                          />
                          <span className="font-medium">{task.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              task.category === 'Fitness'
                                ? 'bg-green-200 text-green-800'
                                : task.category === 'Wellness'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {task.category}
                          </span>
                          {task.assignedByCoach && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Assigned by Coach)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        className="!bg-primary hover:!bg-primary/90 !text-white ml-2 rounded-full px-4 shadow-lg ring-0 hover:ring-2 hover:ring-[#23B685]/40 transition-transform duration-200 ease-out hover:scale-105"
                        onClick={() => handleSaveProgress(milestone.id)}
                      >
                        Save
                      </Button>
                      <Button
                        disabled={!completed}
                        className="!bg-[#23B685] hover:!bg-[#1b946e]"
                      >
                        {completed
                          ? 'Claim Milestone Badge 🎉'
                          : 'Complete all to earn badge'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}