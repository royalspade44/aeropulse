// services/qrLookupService.js
import { getAllUnits } from "./unitStorage";
import { getAllServiceRequests } from "./serviceRequestStorage";
import { getAllTasks } from "./taskStorage";
import { calculateUnitHealthScore } from "./acHealthScoreService";

export function buildUnitQrCode(unit) {
  if (!unit) return "";
  return `UNIT:${unit.id}|SERIAL:${unit.serialNumber || ""}|NAME:${unit.unitName || ""}`;
}

function parseLookupValue(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";

  if (value.startsWith("UNIT:")) {
    const parts = value.split("|");
    const unitPart = parts.find((item) => item.startsWith("UNIT:"));
    return String(unitPart || "").replace("UNIT:", "").trim();
  }

  return value;
}

export async function lookupUnitContext(rawValue) {
  const value = parseLookupValue(rawValue).toLowerCase();
  const [units, requests, tasks] = await Promise.all([
    getAllUnits(),
    getAllServiceRequests(),
    getAllTasks(),
  ]);

  const matchedUnit =
    units.find((unit) => String(unit.id || "").toLowerCase() === value) ||
    units.find((unit) => String(unit.serialNumber || "").toLowerCase() === value) ||
    units.find((unit) => String(unit.unitName || "").toLowerCase() === value);

  if (!matchedUnit) {
    return {
      unit: null,
      requests: [],
      tasks: [],
    };
  }

  const relatedRequests = requests.filter(
    (request) =>
      String(request.unitId || "") === String(matchedUnit.id) ||
      String(request.unitName || "").toLowerCase() === String(matchedUnit.unitName || "").toLowerCase()
  );

  const relatedRequestIds = new Set(relatedRequests.map((request) => String(request.id)));

  const relatedTasks = tasks.filter(
    (task) =>
      String(task.unitId || "") === String(matchedUnit.id) ||
      String(task.unitName || "").toLowerCase() === String(matchedUnit.unitName || "").toLowerCase() ||
      relatedRequestIds.has(String(task.requestId || ""))
  );

  return {
    unit: matchedUnit,
    requests: relatedRequests,
    tasks: relatedTasks,
    health: calculateUnitHealthScore({
      unit: matchedUnit,
      requests: relatedRequests,
      tasks: relatedTasks,
    }),
  };
}
