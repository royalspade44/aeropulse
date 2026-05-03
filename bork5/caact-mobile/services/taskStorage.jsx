// services/taskStorage.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "./api";
import {
  SERVICE_REQUEST_STATUS,
  assignTechnicianToServiceRequest,
  updateServiceRequestStatus,
} from "./serviceRequestStorage";

const STORAGE_KEY = "technician_tasks_storage_v2";

export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function createTimelineEvent({ title, description = "", actor = "System", timestamp }) {
  return {
    id: `task_timeline_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    title: title || "Task Updated",
    description: description || "",
    actor: actor || "System",
    timestamp: timestamp || new Date().toISOString(),
  };
}

export function normalizeTask(item = {}) {
  const createdAt = item.createdAt || new Date().toISOString();
  const title = item.title || item.issueType || "Service Task";
  const description = item.description || item.concern || item.issueDescription || "";
  const laborCost = Number(item.laborCost || 0);
  const partsCost = Number(item.partsCost || 0);
  const additionalCost = Number(item.additionalCost || 0);
  const totalServiceCost =
    item.totalServiceCost === undefined || item.totalServiceCost === null
      ? laborCost + partsCost + additionalCost
      : Number(item.totalServiceCost || 0);
  const completionNotes =
    item.completionNotes ||
    [item.findings, item.resolution, item.notes].filter(Boolean).join(" | ");

  return {
    id: item.id || `task_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    requestId: item.requestId || "",
    title,
    description,
    customerId: item.customerId || item.userId || "",
    customerName: item.customerName || "",
    customerEmail: item.customerEmail || "",
    customerPhone: item.customerPhone || "",
    issueType: item.issueType || "",
    concern: description,
    unitId: item.unitId || null,
    unitName: item.unitName || item.unitType || "",
    unitType: item.unitType || item.unitName || "",
    address: item.address || "",
    plusCode: item.plusCode || "",
    assignedTechnicianId: item.assignedTechnicianId || "",
    assignedTechnicianName: item.assignedTechnicianName || "",
    priority: item.priority || "Normal",
    scheduledDate: item.scheduledDate || item.preferredDate || item.preferredSchedule || "",
    status: item.status || TASK_STATUS.PENDING,
    findings: item.findings || "",
    resolution: item.resolution || "",
    beforeCondition: item.beforeCondition || "",
    afterCondition: item.afterCondition || "",
    partsUsed: item.partsUsed || "",
    laborCost,
    partsCost,
    additionalCost,
    totalServiceCost,
    nextMaintenanceDate: item.nextMaintenanceDate || "",
    customerAdvice: item.customerAdvice || "",
    completionNotes,
    notes: item.notes || "",
    startedAt: item.startedAt || null,
    completedAt: item.completedAt || null,
    timeline:
      Array.isArray(item.timeline) && item.timeline.length > 0
        ? item.timeline
        : [
            createTimelineEvent({
              title: "Task Created",
              description: "Technician task created.",
              actor: "System",
              timestamp: createdAt,
            }),
          ],
    createdAt,
    updatedAt: item.updatedAt || createdAt,
  };
}

function appendTimeline(task, event) {
  const existing = Array.isArray(task.timeline) ? task.timeline : [];
  return [...existing, event];
}

export async function getAllTasks() {
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.fetchTasks(token);
      if (result.success) {
        await saveAllTasks(result.tasks);
        return result.tasks.map(normalizeTask);
      }
    }
  } catch {}

  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed.map(normalizeTask) : [];
}

export async function loadTasks() {
  return getAllTasks();
}

export async function saveAllTasks(items = []) {
  const normalized = items.map(normalizeTask);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function getTaskById(taskId) {
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.fetchTask(token, taskId);
      if (result.success) return normalizeTask(result.task);
    }
  } catch {}

  const tasks = await getAllTasks();
  return tasks.find((item) => String(item.id) === String(taskId)) || null;
}

export async function createTask(payload = {}, actor = "Admin") {
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.createTask(token, normalizeTask(payload));
      if (result.success) {
        const created = normalizeTask(result.task);
        const tasks = await getAllTasks();
        await saveAllTasks([created, ...tasks.filter((task) => task.id !== created.id)]);
        return created;
      }
    }
  } catch {}

  const tasks = await getAllTasks();
  const created = normalizeTask(payload);
  const next = [created, ...tasks];
  await saveAllTasks(next);

  if (created.requestId) {
    await assignTechnicianToServiceRequest(
      created.requestId,
      created.assignedTechnicianId,
      created.assignedTechnicianName,
      created.id,
      actor
    );
  }

  return created;
}

export async function updateTask(taskId, patch = {}) {
  if (typeof taskId === "object" && taskId !== null) {
    const task = taskId;
    return updateTask(task.id, task);
  }

  try {
    const token = await api.getStoredToken();
    if (token) {
      const existing = await getTaskById(taskId);
      const payload = normalizeTask({
        ...(existing || {}),
        ...patch,
        id: taskId,
        updatedAt: new Date().toISOString(),
      });
      const result = await api.patchTask(token, taskId, payload);
      if (result.success) {
        const updated = normalizeTask(result.task);
        const tasks = await getAllTasks();
        await saveAllTasks(
          tasks.map((item) => (String(item.id) === String(taskId) ? updated : item)),
        );
        return updated;
      }
    }
  } catch {}

  const tasks = await getAllTasks();
  const next = tasks.map((item) =>
    String(item.id) === String(taskId)
      ? normalizeTask({
          ...item,
          ...patch,
          updatedAt: new Date().toISOString(),
        })
      : item
  );

  await saveAllTasks(next);
  return next.find((item) => String(item.id) === String(taskId)) || null;
}

export async function updateTaskStatus(taskId, status, actor = "Technician", patch = {}) {
  const tasks = await getAllTasks();
  const target = tasks.find((item) => String(item.id) === String(taskId));
  if (!target) return null;
  const isCompleting = String(status).toLowerCase() === "completed";
  const completionNotes =
    patch.completionNotes ||
    (isCompleting
      ? [
          patch.findings || target.findings,
          patch.resolution || target.resolution,
          patch.customerAdvice || target.customerAdvice,
        ]
          .filter(Boolean)
          .join(" | ")
      : patch.completionNotes);

  const next = tasks.map((item) =>
    String(item.id) === String(taskId)
      ? normalizeTask({
          ...item,
          ...patch,
          status,
          completionNotes,
          startedAt:
            String(status).toLowerCase() === "in progress"
              ? item.startedAt || new Date().toISOString()
              : item.startedAt || null,
          completedAt:
            String(status).toLowerCase() === "completed"
              ? new Date().toISOString()
              : item.completedAt || null,
          timeline: appendTimeline(
            item,
            createTimelineEvent({
              title: `Status changed to ${status}`,
              description: `Task updated to ${status}.`,
              actor,
            })
          ),
          updatedAt: new Date().toISOString(),
        })
      : item
  );

  const updated = next.find((item) => String(item.id) === String(taskId)) || null;

  if (updated) {
    try {
      const token = await api.getStoredToken();
      if (token) {
        const result = await api.patchTask(token, taskId, updated);
        if (result.success) {
          await saveAllTasks(next);
          return normalizeTask(result.task);
        }
      }
    } catch {}
  }

  await saveAllTasks(next);

  if (updated?.requestId) {
    if (String(status).toLowerCase() === "in progress") {
      await updateServiceRequestStatus(
        updated.requestId,
        SERVICE_REQUEST_STATUS.IN_PROGRESS,
        actor,
        "Technician started working on the service request."
      );
    }

    if (String(status).toLowerCase() === "completed") {
      await updateServiceRequestStatus(
        updated.requestId,
        SERVICE_REQUEST_STATUS.COMPLETED,
        actor,
        "Technician completed the service request."
      );
    }
  }

  return updated;
}

export async function getTasksByTechnician(technicianId) {
  try {
    const token = await api.getStoredToken();
    if (token) {
      const result = await api.fetchTasks(token, { technicianId });
      if (result.success) {
        await saveAllTasks(result.tasks);
        return result.tasks.map(normalizeTask);
      }
    }
  } catch {}

  const tasks = await getAllTasks();
  return tasks.filter(
    (item) => String(item.assignedTechnicianId) === String(technicianId)
  );
}

export async function reassignTaskTechnician(taskId, technician = {}) {
  const technicianName =
    technician.name ||
    `${technician.name_first || ""} ${technician.name_last || ""}`.trim() ||
    technician.email ||
    "Technician";

  const updated = await updateTask(taskId, {
    assignedTechnicianId: technician.id || "",
    assignedTechnicianName: technicianName,
  });

  if (updated?.requestId) {
    await assignTechnicianToServiceRequest(
      updated.requestId,
      technician.id || "",
      technicianName,
      updated.id,
      "Admin"
    );
  }

  return updated;
}

export function getTaskStats(tasks = []) {
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === TASK_STATUS.PENDING).length,
    inProgress: tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length,
    completed: tasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length,
    cancelled: tasks.filter((task) => task.status === TASK_STATUS.CANCELLED).length,
  };
}
