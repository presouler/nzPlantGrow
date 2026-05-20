export type GrowthStage = 'seed' | 'sprout' | 'leafy' | 'flowering' | 'harvest';

type GrowthStageIconProps = {
  stage: GrowthStage;
  label?: string;
  className?: string;
};

const stageLabels: Record<GrowthStage, string> = {
  seed: 'Seed stage',
  sprout: 'Sprout stage',
  leafy: 'Leafy growth stage',
  flowering: 'Flowering stage',
  harvest: 'Harvest stage',
};

export function GrowthStageIcon({ stage, label = stageLabels[stage], className }: GrowthStageIconProps) {
  return (
    <span className={`growth-stage-icon growth-stage-icon-${stage}${className ? ` ${className}` : ''}`} role="img" aria-label={label}>
      <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <ellipse className="growth-soil" cx="48" cy="75" rx="31" ry="9" />

        {stage === 'seed' && (
          <>
            <path className="growth-seed" d="M40 68c-6-8-1-19 10-22 8 7 6 19-3 24-3 2-5 1-7-2Z" />
            <path className="growth-seed-shine" d="M45 51c-3 3-4 7-2 11" />
          </>
        )}

        {stage === 'sprout' && (
          <>
            <path className="growth-stem" d="M48 72V45" />
            <path className="growth-leaf growth-leaf-dark" d="M47 52c-12-1-18-8-17-18 11-1 18 6 17 18Z" />
            <path className="growth-leaf" d="M50 53c13-3 19-11 16-21-11 1-18 9-16 21Z" />
          </>
        )}

        {stage === 'leafy' && (
          <>
            <path className="growth-stem" d="M48 73V31M47 58c-9-6-16-13-22-24M49 58c9-6 16-13 22-24" />
            <path className="growth-leaf growth-leaf-dark" d="M45 35C31 28 29 16 42 11c10 8 10 18 3 24Z" />
            <path className="growth-leaf" d="M51 35c14-7 16-19 3-24-10 8-10 18-3 24Z" />
            <path className="growth-leaf" d="M44 58C28 55 20 43 28 31c14 2 21 13 16 27Z" />
            <path className="growth-leaf growth-leaf-light" d="M52 58c16-3 24-15 16-27-14 2-21 13-16 27Z" />
          </>
        )}

        {stage === 'flowering' && (
          <>
            <path className="growth-stem" d="M48 73V33M48 56c-8-5-14-12-19-21M49 57c8-5 14-12 19-21" />
            <path className="growth-leaf growth-leaf-dark" d="M45 58C30 55 23 44 29 33c13 2 20 12 16 25Z" />
            <path className="growth-leaf" d="M52 58c15-3 22-14 16-25-13 2-20 12-16 25Z" />
            <g className="growth-flower">
              <circle cx="48" cy="25" r="5" />
              <path d="M48 20c-4-9 4-13 8-6 9-4 13 4 6 8 4 9-4 13-8 6-9 4-13-4-6-8Z" />
              <circle className="growth-flower-core" cx="48" cy="25" r="4" />
            </g>
          </>
        )}

        {stage === 'harvest' && (
          <>
            <path className="growth-stem" d="M48 73V35M48 59c-8-6-15-13-21-23M49 59c8-6 15-13 21-23" />
            <path className="growth-leaf growth-leaf-dark" d="M44 58C28 55 20 43 28 31c14 2 21 13 16 27Z" />
            <path className="growth-leaf" d="M52 58c16-3 24-15 16-27-14 2-21 13-16 27Z" />
            <circle className="growth-fruit" cx="43" cy="37" r="8" />
            <circle className="growth-fruit growth-fruit-light" cx="56" cy="45" r="7" />
            <path className="growth-fruit-top" d="M43 30l-4-5 1 6-6-1 5 4-4 4 6-1 2 6 2-6 6 1-4-4 5-4-6 1 1-6-4 5Z" />
          </>
        )}
      </svg>
    </span>
  );
}
