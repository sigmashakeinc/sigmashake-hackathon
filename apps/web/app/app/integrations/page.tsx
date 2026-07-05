"use client";

import { useState, useEffect } from "react";
import { useHackathon } from "@/core/hackathon";
import { createIntegrationService, INTEGRATION_DEFINITIONS, type IntegrationConnection } from "@/core/integrations";
import { IntegrationCard } from "@/components/integrations";

export default function IntegrationsPage() {
  const { activeHackathon } = useHackathon();
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeHackathon) return;
    setLoading(true);
    createIntegrationService().getConnections(activeHackathon.id).then((c) => {
      setConnections(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeHackathon]);

  const hackathonId = activeHackathon?.id;

  if (!hackathonId) {
    return (
      <div className="flex items-center justify-center p-lg">
        <p className="text-body-sm text-on-surface-variant">Select a hackathon to configure integrations.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-lg">
      <div className="mb-lg">
        <h1 className="text-h1 font-semibold text-on-surface">Integrations</h1>
        <p className="text-body-sm text-on-surface-variant">
          {connections.length > 0
            ? `${connections.length} integration${connections.length !== 1 ? "s" : ""} configured`
            : "Connect your tools to streamline your workflow"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-xl">
          <div className="flex items-center gap-sm">
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
          {INTEGRATION_DEFINITIONS.map((def) => (
            <IntegrationCard
              key={def.type}
              definition={def}
              connection={connections.find((c) => c.integrationType === def.type) ?? null}
              href={`/app/integrations/${def.type}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
