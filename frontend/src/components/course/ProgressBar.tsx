import { cn } from '../../lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Section, UserProgress } from '../../types';

interface CourseProgressBarProps {
  sections: Section[];
  progress: UserProgress[];
  currentSectionId?: number;
  onSectionClick?: (sectionId: number) => void;
}

export function CourseProgressBar({
  sections,
  progress,
  currentSectionId,
  onSectionClick,
}: CourseProgressBarProps) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto">
      {sections.map((section, idx) => {
        const sectionProgress = progress.find((p) => p.section_id === section.id);
        const isCompleted = sectionProgress?.completed ?? false;
        const isCurrent = section.id === currentSectionId;
        const isLast = idx === sections.length - 1;

        return (
          <div key={section.id} className="flex items-center flex-1 min-w-0">
            <div
              className={cn(
                'flex flex-col items-center gap-1.5 flex-1 min-w-0',
                onSectionClick && 'cursor-pointer',
              )}
              onClick={onSectionClick ? () => onSectionClick(section.id) : undefined}
            >
              <div className="flex items-center w-full">
                {/* Step dot */}
                <div
                  className={cn(
                    'flex items-center justify-center h-7 w-7 rounded-full shrink-0 border-2 transition-colors',
                    isCompleted
                      ? 'bg-success border-success text-success-foreground'
                      : isCurrent
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'h-0.5 flex-1',
                      isCompleted ? 'bg-success' : 'bg-border',
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <p
                className={cn(
                  'text-xs text-center truncate w-full px-1',
                  isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {section.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
