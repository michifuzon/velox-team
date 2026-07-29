"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { EvaluacionRow } from "@/types/database";

export function EvaluacionesView({ evaluaciones }: { evaluaciones: EvaluacionRow[] }) {
  const grupos = new Map<string, EvaluacionRow[]>();
  for (const ev of evaluaciones) {
    const list = grupos.get(ev.tipo) ?? [];
    list.push(ev);
    grupos.set(ev.tipo, list);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...grupos.entries()].map(([tipo, items]) => {
        const ordenadas = [...items].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        const ultima = ordenadas[ordenadas.length - 1];
        const anterior = ordenadas[ordenadas.length - 2];
        const delta =
          anterior && ultima.resultado != null && anterior.resultado != null
            ? ((ultima.resultado - anterior.resultado) / anterior.resultado) * 100
            : null;

        return (
          <Card key={tipo}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-bold text-ink-950">{tipo}</h3>
                <p className="mt-1 text-2xl font-bold text-ink-950">
                  {ultima.resultado ?? "—"}{" "}
                  <span className="text-sm font-normal text-ink-700/50">{ultima.unidad}</span>
                </p>
                <p className="text-xs text-ink-700/50">
                  Última evaluación: {ultima.fecha}
                </p>
                {ultima.comentario_profesor && (
                  <p className="mt-2 text-sm text-ink-700/70">
                    &quot;{ultima.comentario_profesor}&quot;
                  </p>
                )}
              </div>
              {delta !== null && (
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    delta >= 0 ? "bg-status-ok-bg text-status-ok-fg" : "bg-status-overdue-bg text-status-overdue-fg"
                  }`}
                >
                  {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(delta).toFixed(1)}% vs. anterior
                </span>
              )}
            </div>

            {ordenadas.length >= 2 && (
              <div className="mt-4 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordenadas.map((e) => ({ fecha: e.fecha, resultado: e.resultado }))}>
                    <XAxis dataKey="fecha" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="resultado"
                      stroke="var(--color-brand-600)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
