import React from 'react';

export type GaugeColors = {
  base: string; // normal color
  warn: string; // near min/max
  danger: string; // out of bounds
  track: string; // background arc
};

export type GaugeProps = {
  value: number;
  min?: number; // default 0
  max?: number; // default 100
  alarmMin?: number; // alarm minimum threshold
  alarmMax?: number; // alarm maximum threshold
  label?: string;
  unit?: string;
  width?: number; // svg width (ignored when responsive=true)
  height?: number; // svg height (ignored when responsive=true)
  responsive?: boolean; // when true, fills parent container using ResizeObserver
  aspectRatio?: number; // height = width * aspectRatio (only when responsive and container has no explicit height). Default 0.55
  // when the value is within these percentages of the range near bounds, use warn color
  nearMinPercent?: number; // default 0.1 (10% of range above min)
  nearMaxPercent?: number; // default 0.1 (10% of range below max)
  colors?: Partial<GaugeColors>;
  className?: string;
  // custom formatting
  formatValue?: (v: number) => string;
  // dynamic text sizing
  valueFontScale?: number; // default 0.12 (12% of width)
  labelFontScale?: number; // default 0.035 (3.5% of width)
  // scale for arc thickness relative to width
  strokeWidthScale?: number; // default 0.06 (6% of width)
  // extra safe space to avoid clipping (pixels)
  edgeGap?: number; // default 16px
  // visibility controls
  showEdgeLabels?: boolean; // default true (min/max numeric labels below)
  // stroke style
  lineCap?: 'butt' | 'round' | 'square'; // default "round"
  // vertical offset of the central value relative to arc radius (0..1), positive moves upward
  valueOffsetScale?: number; // default 0.10 (10% of radius)
};

const defaultColors: GaugeColors = {
  base: '#3b82f6', // blue-500
  warn: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  track: '#e5e7eb', // zinc-200
};

// Convert polar to cartesian for an arc centered at (cx, cy)
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  // SVG has Y axis growing downwards; use minus on sin to draw upwards
  const angleRad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy - r * Math.sin(angleRad) };
}

// Build a large-arc path for angles between startAngle and endAngle (in degrees)
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Gauge({
  value,
  min = 0,
  max = 100,
  alarmMin,
  alarmMax,
  label,
  unit,
  width = 360,
  height = 200,
  responsive,
  aspectRatio,
  // nearMinPercent = 0.1,
  // nearMaxPercent = 0.1,
  colors: userColors,
  className,
  formatValue,
  valueFontScale = 0.12,
  labelFontScale = 0.035,
  strokeWidthScale = 0.06,
  edgeGap = 16,
  showEdgeLabels = true,
  lineCap = 'butt',
  valueOffsetScale = 0.1,
}: GaugeProps) {
  const colors = {
    ...defaultColors,
    ...(userColors || {}),
  } satisfies GaugeColors;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);

  const isResponsive = responsive || (!width && !height);
  const ar = typeof aspectRatio === 'number' ? aspectRatio : 0.55;

  React.useEffect(() => {
    if (!isResponsive) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        let h = entry.contentRect.height;
        // If parent has no height (common in auto layout), derive from width using aspect ratio
        if (!h || h < 10) {
          h = Math.max(120, w * ar);
        }
        setSize({ w, h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isResponsive, ar]);

  // Geometry
  let svgW = isResponsive ? (size?.w ?? width ?? 360) : (width ?? 360);
  let svgH = isResponsive ? (size?.h ?? height ?? 200) : (height ?? 200);

  // When responsive, fit within both container width/height while keeping aspect ratio
  if (isResponsive && size) {
    const desiredH = svgW * ar;
    if (svgH >= desiredH) {
      // width bound
      svgH = desiredH;
    } else {
      // height bound -> reduce width to maintain aspect
      svgW = svgH / ar;
    }
    // Reserve edge gap: shrink drawable area so content never touches borders
    svgW = Math.max(0, svgW - edgeGap * 2);
    svgH = Math.max(0, svgH - edgeGap * 2);
  }

  // Dynamic thickness and safe padding
  const strokeW = Math.max(10, Math.round(svgW * strokeWidthScale));
  const padding = Math.max(16, Math.round(strokeW * 1.25)) + edgeGap;
  const cx = svgW / 2;
  const cy = svgH - padding; // place center near bottom to make a semicircle visible
  const r = Math.max(0, Math.min(cx, cy) - padding);

  // Angles: 180º (left) to 0º (right) sweeping clockwise on standard math plane
  const startAngle = 180; // left
  const endAngle = 0;

  // Normalize value to 0..1 across min..max
  const span = max - min || 1;
  const v = clamp(value, min, max);
  const t = (v - min) / span; // 0..1
  const valueAngle = 180 - 180 * t; // map to 180..0

  // Determinar cor baseada nos alarmes
  let valueColor = colors.base; // default blue

  if (alarmMin !== undefined && alarmMax !== undefined) {
    if (value < min || value > max) {
      valueColor = colors.danger; // red for critical (fora dos limites min OU max)
    } else if (
      (value >= min && value < alarmMin) ||
      (value > alarmMax && value <= max)
    ) {
      valueColor = colors.warn; // amber for warning (entre min/minAlarm OU maxAlarm/max)
    }
  }

  // Track segments: left warn, middle base, right warn
  // Single track path (gray) and value path (blue)
  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);

  const valuePath = describeArc(cx, cy, r, startAngle, valueAngle);
  const textValue = formatValue
    ? formatValue(value)
    : `${Math.round(value)}${unit ? unit : ''}`;
  const valueFontSize = Math.max(20, Math.round(svgW * valueFontScale));
  const labelFontSize = Math.max(10, Math.round(svgW * labelFontScale));

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: isResponsive ? '100%' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: edgeGap,
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio='xMidYMid meet'
      >
        {/* Track (gray) */}
        <path
          d={trackPath}
          stroke={colors.track}
          strokeWidth={strokeW}
          fill='none'
          strokeLinecap={lineCap}
        />
        {/* Value arc */}
        <path
          d={valuePath}
          stroke={valueColor}
          strokeWidth={strokeW}
          fill='none'
          strokeLinecap={lineCap}
        />

        {/* Ticks: only min and max, highlighted below arc ends */}
        {showEdgeLabels &&
          ([0, 1] as const).map((k, i) => {
            const a = 180 - 180 * k;
            const pOuter = polarToCartesian(cx, cy, r, a);
            const pInner = polarToCartesian(cx, cy, r - 12, a);
            const labelVal = min + span * k;

            const yBelow = Math.min(
              svgH - edgeGap,
              cy + Math.max(14, labelFontSize)
            );
            const isEdge = true;
            const fs = Math.max(12, Math.round(svgW * 0.045));
            const yText = yBelow;

            return (
              <g key={i}>
                <line
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke='#9ca3af'
                  strokeWidth={2}
                />
                <text
                  x={pOuter.x}
                  y={yText}
                  textAnchor='middle'
                  fontSize={fs}
                  fontWeight={isEdge ? 600 : 500}
                  fill={isEdge ? '#111827' : '#6b7280'}
                  dominantBaseline={isEdge ? 'hanging' : 'central'}
                >
                  {Math.round(labelVal)}
                </text>
              </g>
            );
          })}

        {/* Center value */}
        <text
          x={cx}
          y={Math.max(padding + valueFontSize, cy - r * valueOffsetScale)}
          textAnchor='middle'
          fontSize={valueFontSize}
          fontWeight={600}
          fill='#111827'
        >
          {textValue}
        </text>

        {/* Label */}
        {label ? (
          <text
            x={cx}
            y={Math.min(svgH - edgeGap, cy + Math.max(16, labelFontSize))}
            textAnchor='middle'
            fontSize={labelFontSize}
            fontWeight={500}
            fill='#6b7280'
          >
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
