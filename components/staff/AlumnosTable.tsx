"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Input, Select } from "@/components/ui/Field";
import { StatusPill, type PillStatus } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import type { AptoEstado, CuotaEstado } from "@/types/database";

export type AlumnoRow = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string | null;
  fotoUrl: string | null;
  activo: boolean;
  perfilPct: number;
  grupoId: string | null;
  grupoNombre: string | null;
  cuotaEstado: CuotaEstado | null;
  aptoEstado: AptoEstado | null;
};

function cuotaPill(estado: CuotaEstado | null): { status: PillStatus; label: string } {
  if (!estado) return { status: "pendiente", label: "Sin cuota" };
  if (estado === "pagada") return { status: "aprobado", label: "Al día" };
  if (estado === "bonificada") return { status: "aprobado", label: "Bonificada" };
  if (estado === "vencida") return { status: "vencido", label: "Vencida" };
  if (estado === "cancelada") return { status: "pendiente", label: "Cancelada" };
  return { status: "pendiente", label: "Pendiente" };
}

function aptoPill(estado: AptoEstado | null): { status: PillStatus; label: string } {
  if (!estado) return { status: "pendiente", label: "Sin cargar" };
  if (estado === "aprobado") return { status: "aprobado", label: "Aprobado" };
  if (estado === "rechazado") return { status: "rechazado", label: "Rechazado" };
  if (estado === "vencido") return { status: "vencido", label: "Vencido" };
  if (estado === "en_revision") return { status: "en_revision", label: "En revisión" };
  return { status: "pendiente", label: "Pendiente" };
}

export function AlumnosTable({
  rows,
  grupos,
}: {
  rows: AlumnoRow[];
  grupos: { id: string; nombre: string }[];
}) {
  const [query, setQuery] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        q.length === 0 ||
        `${r.nombre} ${r.apellido}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.dni ?? "").toLowerCase().includes(q);
      const matchesGrupo =
        grupoFiltro === "todos" ||
        (grupoFiltro === "sin_grupo" ? !r.grupoId : r.grupoId === grupoFiltro);
      return matchesQuery && matchesGrupo;
    });
  }, [rows, query, grupoFiltro]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/40"
          />
          <Input
            placeholder="Buscar por nombre, apellido, DNI o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={grupoFiltro}
          onChange={(e) => setGrupoFiltro(e.target.value)}
          className="sm:w-56"
        >
          <option value="todos">Todos los grupos</option>
          <option value="sin_grupo">Sin grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No se encontraron alumnos"
            description="Probá ajustar la búsqueda o el filtro de grupo."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Cuota del mes</th>
                <th className="px-4 py-3">Apto médico</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist-200">
              {filtered.map((r) => {
                const cuota = cuotaPill(r.cuotaEstado);
                const apto = aptoPill(r.aptoEstado);
                return (
                  <tr key={r.id} className="transition-colors hover:bg-brand-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/staff/alumnos/${r.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          nombre={r.nombre}
                          apellido={r.apellido}
                          fotoUrl={r.fotoUrl}
                          size={36}
                        />
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-ink-950">
                            {r.nombre} {r.apellido}
                          </p>
                          <p className="truncate text-xs text-ink-700/50">{r.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-700/70">
                      {r.grupoNombre ?? "Sin grupo"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={cuota.status} label={cuota.label} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={apto.status} label={apto.label} />
                    </td>
                    <td className="px-4 py-3 text-ink-700/70">{r.perfilPct}%</td>
                    <td className="px-4 py-3">
                      <StatusPill
                        status={r.activo ? "aprobado" : "vencido"}
                        label={r.activo ? "Activo" : "Inactivo"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
