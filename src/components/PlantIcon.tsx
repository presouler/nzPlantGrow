type PlantIconProps = {
  id?: string;
  icon?: string;
  name: string;
  variant?: IconVariant;
  className?: string;
};

export type IconVariant =
  | 'broad-beans'
  | 'spinach'
  | 'garlic'
  | 'kale'
  | 'parsley'
  | 'lettuce'
  | 'tomato'
  | 'silverbeet'
  | 'coriander'
  | 'kawakawa'
  | 'default';

function normalizeIconVariant(icon: string | undefined): IconVariant | undefined {
  if (!icon) return undefined;

  const normalized = icon.toLowerCase().trim().replace(/_/g, '-');

  if (normalized === 'broad-bean' || normalized === 'broad-beans') return 'broad-beans';
  if (normalized === 'spinach') return 'spinach';
  if (normalized === 'garlic') return 'garlic';
  if (normalized === 'kale') return 'kale';
  if (normalized === 'parsley') return 'parsley';
  if (normalized === 'lettuce') return 'lettuce';
  if (normalized === 'tomato') return 'tomato';
  if (normalized === 'silverbeet' || normalized === 'silver-beet' || normalized === 'swiss-chard') return 'silverbeet';
  if (normalized === 'coriander' || normalized === 'cilantro') return 'coriander';
  if (normalized === 'kawakawa') return 'kawakawa';
  if (normalized === 'default' || normalized === 'seedling') return 'default';

  return undefined;
}

function inferIconVariant(id: string | undefined, name: string): IconVariant {
  const source = `${id ?? ''} ${name}`.toLowerCase();

  if (
    source.includes('broad-bean') ||
    source.includes('broad-beans') ||
    source.includes('broad beans') ||
    source.includes('broad bean')
  ) return 'broad-beans';
  if (source.includes('spinach')) return 'spinach';
  if (source.includes('garlic')) return 'garlic';
  if (source.includes('kale')) return 'kale';
  if (source.includes('parsley')) return 'parsley';
  if (source.includes('lettuce')) return 'lettuce';
  if (source.includes('tomato')) return 'tomato';
  if (source.includes('silverbeet') || source.includes('swiss chard')) return 'silverbeet';
  if (source.includes('coriander') || source.includes('cilantro')) return 'coriander';
  if (source.includes('kawakawa')) return 'kawakawa';
  return 'default';
}

function getIconVariant(icon: string | undefined, variant: IconVariant | undefined, id: string | undefined, name: string): IconVariant {
  return normalizeIconVariant(icon) ?? variant ?? inferIconVariant(id, name);
}

function Leaf({ d, className = 'plant-leaf' }: { d: string; className?: string }) {
  return <path className={className} d={d} />;
}

export function PlantIcon({ id, icon, name, variant: variantOverride, className }: PlantIconProps) {
  const variant = getIconVariant(icon, variantOverride, id, name);
  const label = `${name} icon`;

  return (
    <span className={`plant-icon plant-icon-${variant}${className ? ` ${className}` : ''}`} role="img" aria-label={label}>
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle className="plant-icon-bg" cx="32" cy="32" r="29" />

        {variant === 'broad-beans' && (
          <>
            <path className="bean-pod" d="M16 45C20 28 34 16 49 14c3 16-5 31-20 37-5 2-10 1-13-6Z" />
            <path className="bean-pod-seam" d="M20 43c8-9 17-17 28-25" />
            <ellipse className="broad-bean-seed" cx="24" cy="39" rx="5.7" ry="7.5" transform="rotate(-38 24 39)" />
            <ellipse className="broad-bean-seed broad-bean-seed-light" cx="34" cy="30" rx="5.3" ry="7" transform="rotate(-38 34 30)" />
            <ellipse className="broad-bean-seed" cx="43" cy="22" rx="4.8" ry="6.2" transform="rotate(-35 43 22)" />
            <path className="plant-stem" d="M16 45c-3 3-5 5-7 6" />
          </>
        )}

        {variant === 'spinach' && (
          <>
            <path className="plant-stem spinach-stem" d="M32 53V23M32 42c-7-5-13-11-18-19M33 42c7-5 13-11 17-19" />
            <Leaf d="M31 25C18 19 17 9 30 6c9 7 9 15 1 19Z" className="spinach-leaf spinach-leaf-dark" />
            <Leaf d="M33 25c13-6 14-16 1-19-9 7-9 15-1 19Z" className="spinach-leaf" />
            <Leaf d="M30 42C16 39 10 29 17 19c12 2 18 12 13 23Z" className="spinach-leaf" />
            <Leaf d="M35 42c14-3 20-13 13-23-12 2-18 12-13 23Z" className="spinach-leaf spinach-leaf-light" />
            <path className="plant-vein spinach-vein" d="M32 50V10M28 34l-9-9M36 34l9-9" />
          </>
        )}

        {variant === 'garlic' && (
          <>
            <path className="garlic-shoot" d="M30 26C22 18 22 10 27 6M34 26C43 17 42 10 37 6M32 27C32 18 35 11 42 8" />
            <path className="garlic-bulb" d="M17 35c0-8 5-14 11-16 2-4 6-4 8 0 7 2 12 8 12 16 0 12-6 20-16 20s-15-8-15-20Z" />
            <path className="garlic-clove garlic-clove-left" d="M24 24c-5 8-5 21 1 30" />
            <path className="garlic-clove" d="M32 20c-3 10-3 24 0 34" />
            <path className="garlic-clove garlic-clove-right" d="M40 24c5 8 5 21-1 30" />
            <path className="garlic-root" d="M26 55c-2 2-5 2-7 1M32 56c-1 3-3 4-5 5M38 55c2 2 5 2 7 1" />
          </>
        )}

        {variant === 'kale' && (
          <>
            <path className="plant-stem kale-stem" d="M32 53V19" />
            <path className="kale-leaf" d="M32 15c-6-9-15-3-13 6-10 1-12 12-4 17-5 8 5 17 14 11 2 5 8 5 10 0 9 6 19-3 14-11 8-5 6-16-4-17 2-9-7-15-13-6-1-4-3-6-4-6s-3 2-4 6Z" />
            <path className="kale-ruffle" d="M20 27c7-5 17-4 24 0M18 38c8-5 20-5 29 0M24 47c5-3 12-3 17 0" />
            <path className="plant-vein kale-vein" d="M32 52V17M32 32l-10-8M33 32l10-8M31 41l-12-1M34 41l11-1" />
          </>
        )}

        {variant === 'parsley' && (
          <>
            <path className="plant-stem parsley-stems" d="M32 53V24M31 52C28 40 23 31 16 24M33 52c3-12 8-21 15-28" />
            <path className="parsley-leaf parsley-left" d="M15 32c-7-4-4-13 4-11-1-8 9-10 12-3 5-6 14-1 11 7 7 2 7 12-1 14-1 8-12 9-15 2-6 5-15 0-11-9Z" />
            <path className="parsley-leaf parsley-right" d="M35 31c-7-4-4-13 4-11-1-7 8-10 12-3 5-5 12-1 10 6 6 2 6 10-1 12-1 7-10 8-13 2-5 5-13 0-12-6Z" />
            <path className="parsley-cut" d="M18 27l-5-4M24 19l-1-6M31 25l5-4M42 26l-4-5M50 19l2-6M53 29l6-2" />
          </>
        )}

        {variant === 'lettuce' && (
          <>
            <path className="lettuce-head" d="M15 40c-5-12 5-23 14-18 3-10 17-11 21 1 10 4 9 20-2 25-8 8-27 6-33-8Z" />
            <path className="lettuce-inner lettuce-inner-dark" d="M31 49c-8-5-13-14-10-23 8 1 13 9 10 23Z" />
            <path className="lettuce-inner" d="M35 49c7-6 11-15 7-25-8 3-12 11-7 25Z" />
            <path className="lettuce-core" d="M32 50c-2-13 0-23 6-31M31 47c-8-6-12-13-10-22M38 39c5-4 9-5 14-4M27 39c-5-4-9-5-14-3" />
          </>
        )}

        {variant === 'tomato' && (
          <>
            <circle className="tomato" cx="32" cy="38" r="16" />
            <circle className="tomato tomato-small" cx="44" cy="43" r="8" />
            <path className="plant-stem tomato-stem" d="M33 18v-8" />
            <path className="tomato-top" d="M32 20l-6-8 1 9-8-3 7 6-6 6 9-2 3 9 3-9 9 2-6-6 7-6-8 3 1-9-6 8Z" />
            <path className="tomato-shine" d="M23 34c4-5 9-7 15-6M42 40c2-1 4-1 6 0" />
          </>
        )}

        {variant === 'silverbeet' && (
          <>
            <Leaf d="M29 48C13 41 11 24 23 12c13 5 15 22 6 36Z" className="silverbeet-leaf" />
            <Leaf d="M35 48c16-7 18-24 6-36-13 5-15 22-6 36Z" className="silverbeet-leaf silverbeet-leaf-light" />
            <path className="silverbeet-stem" d="M32 54V15M31 45c-5-8-8-17-8-29M33 45c5-8 8-17 8-29" />
            <path className="silverbeet-side-vein" d="M29 33l-10-6M35 33l10-6M29 42l-9-2M35 42l9-2" />
          </>
        )}

        {variant === 'coriander' && (
          <>
            <path className="plant-stem coriander-stems" d="M32 53V28M32 44c-8-6-13-13-17-23M33 44c8-6 13-13 17-23" />
            <path className="coriander-leaf" d="M15 30c-5-3-3-10 3-9-1-6 6-9 10-4 4-5 12-1 10 5 6 0 8 8 2 11-4 3-10 2-13-2-4 4-9 3-12-1Z" />
            <path className="coriander-leaf coriander-light" d="M35 30c-5-3-3-10 3-9-1-6 6-9 10-4 4-5 11-1 10 5 6 1 7 8 1 11-4 3-9 2-12-2-4 4-9 3-12-1Z" />
            <path className="coriander-cut" d="M18 25l-5-3M24 19l-2-5M32 24l5-4M40 25l-4-5M49 19l2-5M54 26l5-2M22 33c4 3 8 3 12 0M39 33c4 3 8 3 12 0" />
          </>
        )}

        {variant === 'kawakawa' && (
          <>
            <path className="plant-stem kawakawa-stem" d="M32 53V40" />
            <path className="kawakawa-leaf" d="M32 41C16 30 12 14 25 8c4-2 7 2 7 7 0-5 3-9 7-7 13 6 9 22-7 33Z" />
            <path className="plant-vein kawakawa-vein" d="M32 39V14M32 27l-11-8M32 28l11-9M32 34l-13-1M32 34l13-1" />
            <circle className="kawakawa-dot" cx="24" cy="27" r="1.8" />
            <circle className="kawakawa-dot" cx="39" cy="24" r="1.6" />
            <circle className="kawakawa-dot" cx="30" cy="33" r="1.4" />
          </>
        )}

        {variant === 'default' && (
          <>
            <path className="plant-stem" d="M32 52V25" />
            <Leaf d="M30 31C19 23 21 13 31 10c9 7 8 16-1 21Z" />
            <Leaf d="M34 34c12-7 14-17 3-23-9 7-10 16-3 23Z" className="plant-leaf plant-leaf-light" />
          </>
        )}
      </svg>
    </span>
  );
}
