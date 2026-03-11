import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toneClass } from "@/lib/utils";
import type { GatewayStatus, NodeStatus } from "@/lib/types";

export function StatusStrip({
  gateway,
  nodes,
  todayCost,
}: {
  gateway: GatewayStatus;
  nodes: NodeStatus[];
  todayCost: string;
}) {
  return (
    <Card className="grid gap-3 p-4 lg:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gateway</p>
        <div className="mt-2 flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${toneClass(gateway.online ? "healthy" : "error")}`} />
          <p className="text-sm text-slate-100">{gateway.message}</p>
          <Badge>{gateway.latencyMs ? `${gateway.latencyMs} ms` : "offline"}</Badge>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Nodes</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {nodes.map((node) => (
            <Badge key={node.name} className="gap-2 normal-case tracking-normal">
              <span className={`h-2 w-2 rounded-full ${toneClass(node.status)}`} />
              {node.name}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today Cost</p>
        <p className="mt-2 text-xl font-semibold text-cyan-300">{todayCost}</p>
      </div>
    </Card>
  );
}
