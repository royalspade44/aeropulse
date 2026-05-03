// services/auditLogService.jsx
import {
  loadAuditLogsFromStorage,
  saveAuditLogsToStorage,
} from "./authStorage";

export async function appendAuditLog({
  action,
  actor,
  actorId = null,
  actorEmail = "",
  targetId = "",
  details = "",
}) {
  const existing = await loadAuditLogsFromStorage();
  const entry = {
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    timestamp: new Date().toISOString(),
    action: action || "UNKNOWN_ACTION",
    actorId: actorId || actor?.id || null,
    actorName:
      actor?.name ||
      `${actor?.name_first || ""} ${actor?.name_last || ""}`.trim() ||
      actorEmail ||
      "System",
    actorEmail: actorEmail || actor?.email || "",
    targetId,
    details,
  };

  const next = [entry, ...(existing || [])];
  await saveAuditLogsToStorage(next);
  return entry;
}
