"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ChartColumn,
  ChartLine,
  Gauge,
  ScanFace,
  Trash,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EMOTION_LABELS } from "@/lib/types";
import type { DetectionSource, Emotion } from "@/lib/types";
import { EMOTIONS, emotionMeta } from "@/lib/emotions";
import { useSession } from "@/lib/session";
import { btnGhost, card, monoChip, pageShell } from "@/lib/ui";

const AXIS_TICK = { fill: "#93a7c4", fontSize: 11 } as const;
const AXIS_LINE = "rgba(148,163,184,0.18)";
const GRID_LINE = "rgba(148,163,184,0.10)";

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-line bg-abyss/95 px-3 py-2 shadow-xl">
      {label !== undefined && (
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <p key={index} className="mt-0.5 font-display text-[12.5px] text-frost">
          {entry.name}:{" "}
          <span style={{ color: entry.color ?? "var(--color-accent)" }}>
            {typeof entry.value === "number"
              ? `${entry.value.toFixed(entry.value % 1 === 0 ? 0 : 1)}`
              : String(entry.value ?? "")}
          </span>
        </p>
      ))}
    </div>
  );
}

const SOURCE_LABEL: Record<DetectionSource, string> = {
  webcam: "Webcam",
  image: "Image",
  video: "Video",
};

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2.5 font-display text-2xl font-semibold text-frost">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-muted/80">{hint}</p>
    </div>
  );
}

export default function AnalyticsClient() {
  const { records, stats, clearSession } = useSession();
  const [confirmClear, setConfirmClear] = useState(false);

  const distribution = useMemo(
    () =>
      EMOTION_LABELS.map((key) => {
        const meta = emotionMeta(key);
        return {
          key,
          name: meta.label,
          value: stats.distribution[key],
          color: meta.color,
        };
      }).filter((entry) => entry.value > 0),
    [stats.distribution],
  );

  const confidenceByEmotion = useMemo(
    () =>
      EMOTION_LABELS.map((key) => {
        const meta = emotionMeta(key);
        const average = stats.averageConfidenceByEmotion[key];
        return {
          key,
          name: meta.label,
          value: average === null ? null : Number((average * 100).toFixed(1)),
          color: meta.color,
        };
      }).filter((entry) => entry.value !== null),
    [stats.averageConfidenceByEmotion],
  );

  const timeline = useMemo(
    () =>
      records.map((record, index) => ({
        seq: index + 1,
        confidence: Number((record.confidence * 100).toFixed(1)),
        emotion: emotionMeta(record.emotion).label,
        at: new Date(record.timestamp).toLocaleTimeString(),
      })),
    [records],
  );

  const history = useMemo(() => records.slice(-12).reverse(), [records]);

  const confidenceRange = useMemo(() => {
    if (records.length === 0) return null;
    const values = records.map((record) => record.confidence * 100);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [records]);

  const hasData = records.length > 0;

  return (
    <div className={`${pageShell} pb-24 pt-28`}>
      {/* ---------------------------------------------------------- header */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="label-chip">Session analytics</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-frost sm:text-4xl">
            Your detection history
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            These charts aggregate every analysis this browser session sent to
            the backend. No values are seeded — if a chart looks empty, no
            predictions have been made yet.
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <button
                  type="button"
                  className={`${btnGhost} border-danger/50 text-danger hover:border-danger`}
                  onClick={() => {
                    clearSession();
                    setConfirmClear(false);
                  }}
                >
                  <Trash size={14} aria-hidden="true" /> Yes, clear
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setConfirmClear(false)}
                >
                  Keep data
                </button>
              </>
            ) : (
              <button
                type="button"
                className={btnGhost}
                onClick={() => setConfirmClear(true)}
              >
                <Trash size={14} aria-hidden="true" /> Clear session
              </button>
            )}
          </div>
        )}
      </header>

      {!hasData ? (
        <div className={`${card} flex flex-col items-center gap-4 px-6 py-16 text-center`}>
          <ChartColumn size={30} aria-hidden="true" className="text-muted/50" />
          <div>
            <h2 className="font-display text-lg font-semibold text-frost">
              No analyses yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted">
              Run a webcam session, upload a photo or scan a video on the
              dashboard — every prediction will show up here instantly.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-semibold text-abyss transition-all hover:bg-white"
          >
            <ScanFace size={15} aria-hidden="true" /> Open the dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* ------------------------------------------------ stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Activity size={14} aria-hidden="true" />}
              label="Analyses"
              value={String(stats.totalAnalyses)}
              hint="Backend responses in this session"
            />
            <StatCard
              icon={<ScanFace size={14} aria-hidden="true" />}
              label="Faces found"
              value={String(stats.totalFaces)}
              hint={`Across ${SOURCE_LABEL.webcam}, image & video sources`}
            />
            <StatCard
              icon={<Gauge size={14} aria-hidden="true" />}
              label="Avg confidence"
              value={`${(stats.averageConfidence * 100).toFixed(1)}%`}
              hint={
                confidenceRange
                  ? `Range ${confidenceRange.min.toFixed(0)}–${confidenceRange.max.toFixed(0)}%`
                  : "—"
              }
            />
            <StatCard
              icon={<ChartLine size={14} aria-hidden="true" />}
              label="Avg inference"
              value={`${stats.averageInferenceMs.toFixed(0)} ms`}
              hint="Model time per image, server-side"
            />
          </div>

          {/* ------------------------------------------- donut + bars */}
          <div className="grid gap-5 lg:grid-cols-2">
            <section aria-labelledby="chart-distribution" className={`${card} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 id="chart-distribution" className="font-display text-sm font-semibold tracking-wider text-frost">
                    Emotion distribution
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Dominant emotion per analysis
                  </p>
                </div>
                <span className={monoChip}>
                  {stats.topEmotion
                    ? `TOP · ${stats.topEmotion.toUpperCase()}`
                    : "—"}
                </span>
              </div>

              <div className="relative h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="rgba(5,8,15,0.8)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {distribution.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-semibold text-frost">
                    {stats.totalAnalyses}
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
                    predictions
                  </span>
                </div>
              </div>

              {/* Legend doubles as the accessible data table */}
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {distribution.map((entry) => (
                  <li key={entry.key} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ background: entry.color }}
                      aria-hidden="true"
                    />
                    <span className="text-muted">{entry.name}</span>
                    <span className="ml-auto font-mono text-frost">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="chart-confidence" className={`${card} p-5`}>
              <div className="mb-4">
                <h2 id="chart-confidence" className="font-display text-sm font-semibold tracking-wider text-frost">
                  Average confidence by emotion
                </h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Mean winning-class probability when this emotion won
                </p>
              </div>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={confidenceByEmotion}
                    margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                  >
                    <CartesianGrid stroke={GRID_LINE} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={AXIS_TICK}
                      axisLine={{ stroke: AXIS_LINE }}
                      tickLine={false}
                      interval={0}
                      angle={-32}
                      textAnchor="end"
                      height={54}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                    <Bar dataKey="value" name="Confidence" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                      {confidenceByEmotion.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------- timeline */}
          <section aria-labelledby="chart-timeline" className={`${card} p-5`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id="chart-timeline" className="font-display text-sm font-semibold tracking-wider text-frost">
                  Confidence timeline
                </h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Winning-class confidence across the session, oldest → newest
                </p>
              </div>
              <span className={monoChip}>{records.length} POINTS</span>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                  <defs>
                    <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_LINE} vertical={false} />
                  <XAxis
                    dataKey="seq"
                    tick={AXIS_TICK}
                    axisLine={{ stroke: AXIS_LINE }}
                    tickLine={false}
                    tickFormatter={(value: number) => `#${value}`}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                    width={52}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#confidenceFill)"
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 4, fill: "#22d3ee", stroke: "#05080f", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ---------------------------------------- sources + history */}
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <section aria-labelledby="source-title" className={`${card} p-5`}>
              <h2 id="source-title" className="mb-4 font-display text-sm font-semibold tracking-wider text-frost">
                Analyses by source
              </h2>

              <ul className="flex flex-col gap-4">
                {(Object.keys(stats.bySource) as DetectionSource[]).map((source) => {
                  const count = stats.bySource[source];
                  const share = stats.totalAnalyses > 0
                    ? (count / stats.totalAnalyses) * 100
                    : 0;

                  return (
                    <li key={source}>
                      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                        <span className="text-frost">{SOURCE_LABEL[source]}</span>
                        <span className="font-mono text-muted">
                          {count} · {share.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-accent/80"
                          style={{ width: `${Math.max(count > 0 ? 3 : 0, share)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 border-t border-line pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Most common
                </p>
                {stats.topEmotion ? (
                  <p
                    className="mt-1.5 font-display text-xl font-semibold"
                    style={{ color: emotionMeta(stats.topEmotion as Emotion).color }}
                  >
                    {emotionMeta(stats.topEmotion as Emotion).label}
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-muted">—</p>
                )}
              </div>
            </section>

            <section aria-labelledby="history-title" className={`${card} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 id="history-title" className="font-display text-sm font-semibold tracking-wider text-frost">
                  Recent analyses
                </h2>
                <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
                  LAST {history.length} OF {records.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line">
                      {["Time", "Source", "Emotion", "Conf.", "Faces", "Infer"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => {
                      const meta = emotionMeta(record.emotion);
                      return (
                        <tr key={record.id} className="border-b border-line/60 last:border-0">
                          <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[11.5px] text-muted">
                            {new Date(record.timestamp).toLocaleTimeString()}
                            {record.label ? (
                              <span className="ml-1.5 text-muted/60">{record.label}</span>
                            ) : null}
                          </td>
                          <td className="px-5 py-2.5 text-[12.5px] text-frost/85">
                            {SOURCE_LABEL[record.source]}
                          </td>
                          <td className="px-5 py-2.5">
                            <span
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
                              style={{ color: meta.color }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: meta.color }}
                                aria-hidden="true"
                              />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 font-mono text-[12px] text-frost">
                            {(record.confidence * 100).toFixed(0)}%
                          </td>
                          <td className="px-5 py-2.5 font-mono text-[12px] text-muted">
                            {record.faceCount}
                          </td>
                          <td className="px-5 py-2.5 font-mono text-[12px] text-muted">
                            {record.inferenceMs.toFixed(0)} ms
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="text-[11.5px] leading-relaxed text-muted/70">
            Records live in memory only — they disappear when you reload the
            page or clear the session, and are never sent anywhere.
            Emotion palette: {EMOTIONS.length} FER+ classes.
          </p>
        </div>
      )}
    </div>
  );
}
