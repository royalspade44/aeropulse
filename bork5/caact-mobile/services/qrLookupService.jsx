// services/qrLookupService.js
import { getAllUnits } from "./unitStorage";
import { getAllServiceRequests } from "./serviceRequestStorage";
import { getAllTasks } from "./taskStorage";
import { calculateUnitHealthScore } from "./acHealthScoreService";
import { getUnitHealthInsight } from "./api";

export function buildUnitQrCode(unit) {
  if (!unit) return "";
  return `UNIT:${unit.id}|SERIAL:${unit.serialNumber || ""}|NAME:${unit.unitName || ""}`;
}

function parseQrTags(rawValue = "") {
  const value = String(rawValue || "").trim();
  const tags = {};

  value.split("|").forEach((segment) => {
    const index = segment.indexOf(":");
    if (index < 0) return;

    const key = segment.slice(0, index).trim().toUpperCase();
    const tagValue = segment.slice(index + 1).trim();
    if (key) {
      tags[key] = tagValue;
    }
  });

  if (!tags.UNIT && value.startsWith("UNIT:")) {
    tags.UNIT = value.replace(/^UNIT:/i, "").split("|")[0].trim();
  }

  return tags;
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

export async function lookupUnitContext(rawValue, { token } = {}) {
  const value = parseLookupValue(rawValue).toLowerCase();
  const tags = parseQrTags(rawValue);
  const [units, requests, tasks] = await Promise.all([
    getAllUnits(),
    getAllServiceRequests(),
    getAllTasks(),
  ]);

  const matchedUnit =
    units.find((unit) => String(unit.id || "").toLowerCase() === String(tags.UNIT || "").toLowerCase()) ||
    units.find((unit) => String(unit.id || "").toLowerCase() === value) ||
    units.find((unit) => String(unit.serialNumber || "").toLowerCase() === value) ||
    units.find((unit) => String(unit.unitName || "").toLowerCase() === value);

  const matchedRequest =
    requests.find((request) => String(request.id || "").toLowerCase() === String(tags.REQUEST || "").toLowerCase()) ||
    null;

  const matchedTask =
    tasks.find((task) => String(task.id || "").toLowerCase() === String(tags.TASK || "").toLowerCase()) ||
    (matchedRequest?.linkedTaskId
      ? tasks.find((task) => String(task.id || "") === String(matchedRequest.linkedTaskId))
      : null) ||
    null;

  const unitFromTask = matchedTask?.unitId
    ? units.find((unit) => String(unit.id || "") === String(matchedTask.unitId))
    : null;

  const resolvedUnit = matchedUnit || unitFromTask || null;

  if (!resolvedUnit) {
    return {
      unit: null,
      requests: [],
      tasks: [],
      matchedRequest,
      matchedTask,
      scanContext: tags,
    };
  }

  const relatedRequests = requests.filter(
    (request) =>
      String(request.unitId || "") === String(resolvedUnit.id) ||
      String(request.unitName || "").toLowerCase() === String(resolvedUnit.unitName || "").toLowerCase() ||
      String(request.id || "").toLowerCase() === String(tags.REQUEST || "").toLowerCase()
  );

  const relatedRequestIds = new Set(relatedRequests.map((request) => String(request.id)));

  const relatedTasks = tasks.filter(
    (task) =>
      String(task.unitId || "") === String(resolvedUnit.id) ||
      String(task.unitName || "").toLowerCase() === String(resolvedUnit.unitName || "").toLowerCase() ||
      relatedRequestIds.has(String(task.requestId || "")) ||
      String(task.id || "").toLowerCase() === String(tags.TASK || "").toLowerCase()
  );

  const localHealth = calculateUnitHealthScore({
    unit: resolvedUnit,
    requests: relatedRequests,
    tasks: relatedTasks,
  });

  let health = localHealth;
  if (token) {
    const remote = await getUnitHealthInsight(token, {
      unit: resolvedUnit,
      requests: relatedRequests,
      tasks: relatedTasks,
      baseline: localHealth,
    });

    if (remote.success && remote.insight) {
      const insight = remote.insight || {};
      health = {
        ...localHealth,
        score: Number.isFinite(Number(insight.score))
          ? Math.max(0, Math.min(100, Math.round(Number(insight.score))))
          : localHealth.score,
        label: insight.label || localHealth.label,
        recommendation: insight.recommendation || localHealth.recommendation,
        aiPrediction: {
          ...localHealth.aiPrediction,
          model: remote.provider === "openai" ? "OpenAI" : localHealth.aiPrediction.model,
          lifecycleLabel: insight.lifecycleLabel || localHealth.aiPrediction.lifecycleLabel,
          estimatedRemainingMonths: Number.isFinite(Number(insight.estimatedRemainingMonths))
            ? Number(insight.estimatedRemainingMonths)
            : localHealth.aiPrediction.estimatedRemainingMonths,
          estimatedRemainingYears: Number.isFinite(Number(insight.estimatedRemainingYears))
            ? Number(insight.estimatedRemainingYears)
            : localHealth.aiPrediction.estimatedRemainingYears,
          maintenanceIntervalMonths: Number.isFinite(Number(insight.maintenanceIntervalMonths))
            ? Number(insight.maintenanceIntervalMonths)
            : localHealth.aiPrediction.maintenanceIntervalMonths,
          nextMaintenanceDate: insight.nextMaintenanceDate || localHealth.aiPrediction.nextMaintenanceDate,
          riskFactors: Array.isArray(insight.riskFactors) && insight.riskFactors.length > 0
            ? insight.riskFactors
            : localHealth.aiPrediction.riskFactors,
          predictionSummary: insight.summary || localHealth.aiPrediction.predictionSummary,
          source: remote.provider,
          generatedAt: remote.generatedAt,
        },
      };
    }
  }

  return {
    unit: resolvedUnit,
    requests: relatedRequests,
    tasks: relatedTasks,
    matchedRequest,
    matchedTask,
    scanContext: tags,
    health,
  };
}
