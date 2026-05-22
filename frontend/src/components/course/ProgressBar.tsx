import { ProgressIndicator, ProgressStep } from '@carbon/react';
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
  const currentIndex = currentSectionId
    ? sections.findIndex((s) => s.id === currentSectionId)
    : -1;

  return (
    <ProgressIndicator
      currentIndex={currentIndex >= 0 ? currentIndex : 0}
      spaceEqually
    >
      {sections.map((section) => {
        const sectionProgress = progress.find((p) => p.section_id === section.id);
        const isCompleted = sectionProgress?.completed ?? false;
        const isCurrent = section.id === currentSectionId;

        return (
          <ProgressStep
            key={section.id}
            label={section.title}
            description={`${section.estimated_minutes} min`}
            complete={isCompleted}
            current={isCurrent}
            onClick={onSectionClick ? () => onSectionClick(section.id) : undefined}
          />
        );
      })}
    </ProgressIndicator>
  );
}
