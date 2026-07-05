"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createRelationshipService, MODULE_LABELS } from "@/core/relationships";

const MODULE_COLORS: Record<string, string> = {
  idea: "#3fb950", task: "#e01e2e", note: "#d29922", file: "#b5b5b5",
  objective: "#e01e2e", milestone: "#d29922", deliverable: "#3fb950",
  requirement: "#b5b5b5", risk: "#e01e2e", decision: "#3fb950",
  research: "#d29922", submission: "#e01e2e",
};

export default function RelationshipsPage() {
  const router = useRouter();
  const { activeHackathon } = useHackathon();
  const [graph, setGraph] = useState<{ nodes: { id: string; module: string; label: string; x: number; y: number }[]; edges: { source: string; target: string; type: string }[] }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [_pan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ node: string; x: number; y: number } | null>(null);
  const [filterModule, setFilterModule] = useState("");

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    createRelationshipService().getGraph(activeHackathon.id).then(setGraph).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, [activeHackathon]);

  let nodes = graph.nodes;
  let edges = graph.edges;

  if (filterModule) {
    const filteredIds = new Set(nodes.filter((n) => n.module === filterModule).map((n) => n.id));
    edges = edges.filter((e) => filteredIds.has(e.source) || filteredIds.has(e.target));
    nodes = nodes.filter((n) => filteredIds.has(n.id));
  }

  function handleNodeMouseDown(e: React.MouseEvent, nodeId: string) {
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragging({ node: nodeId, x: e.clientX - node.x, y: e.clientY - node.y });
  }

  useEffect(() => {
    if (!dragging) return;
    function onMouseMove(e: MouseEvent) {
      setGraph((g) => ({
        ...g,
        nodes: g.nodes.map((n) =>
          n.id === dragging!.node ? { ...n, x: e.clientX - dragging!.x, y: e.clientY - dragging!.y } : n,
        ),
      }));
    }
    function onMouseUp() { setDragging(null); }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [dragging]);

  if (!activeHackathon) { router.replace("/app"); return null; }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/30 px-lg py-md">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Relationships</h1>
          <p className="font-mono text-[11px] text-on-surface-variant">{graph.nodes.length} items · {graph.edges.length} connections</p>
        </div>
        <div className="flex items-center gap-sm">
          <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}
            className="h-8 rounded border border-outline-variant bg-black px-sm text-body-sm text-on-surface focus:border-primary focus:outline-none">
            <option value="">All modules</option>
            {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button type="button" onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface">+</button>
          <span className="font-mono text-[10px] text-on-surface-variant">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
            className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface">−</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-sm text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">hub</span>
          <p className="text-body-sm text-on-surface-variant">No relationships yet. Link items to see them here.</p>
        </div>
      ) : (
        <svg ref={svgRef} className="flex-1" onWheel={(e) => setZoom((z) => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)))}>
          <g transform={`translate(${_pan.x}, ${_pan.y}) scale(${zoom})`}>
            {edges.map((edge, i) => {
              const src = nodes.find((n) => n.id === edge.source);
              const tgt = nodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;
              return (
                <line key={`e${i}`} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke="currentColor" strokeWidth="1" className="text-outline-variant/30" />
              );
            })}
            {nodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{ cursor: "grab" }}
                className="transition-opacity hover:opacity-80"
              >
                <circle r="18" fill={MODULE_COLORS[node.module] ?? "#343535"} opacity="0.8" />
                <text textAnchor="middle" dy="4" fill="white" fontSize="10" fontFamily="monospace">
                  {node.module.slice(0, 3)}
                </text>
                <text textAnchor="middle" y="30" fill="currentColor" fontSize="9" fontFamily="monospace" className="fill-on-surface-variant">
                  {MODULE_LABELS[node.module] ?? node.module}
                </text>
              </g>
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
