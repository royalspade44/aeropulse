// services/partsRequestService.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";

const TECH_PARTS_KEY = "parts_requests_storage_v2";

export const PARTS_REQUEST_STATUS = {
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
  ASSIGNED: "Assigned",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizePartsRequest(request = {}) {
  const requestedAt = request.requestedAt || request.createdAt || new Date().toISOString();
  return {
    id: request.id || `parts_request_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    taskId: request.taskId || "",
    technicianId: request.technicianId || "",
    technicianName: request.technicianName || "",
    inventoryItemId: request.inventoryItemId || "",
    partName: request.partName || request.name || "",
    quantity: Number(request.quantity || 1),
    reason: request.reason || "",
    priority: request.priority || "Normal",
    status: request.status || PARTS_REQUEST_STATUS.SUBMITTED,
    requestedAt,
    updatedAt: request.updatedAt || requestedAt,
  };
}

async function getAllPartsRequests() {
  const raw = await AsyncStorage.getItem(TECH_PARTS_KEY);
  const all = safeParse(raw, []);
  return Array.isArray(all) ? all.map(normalizePartsRequest) : [];
}

export async function getPartsRequestsByTechnician(techId) {
  const all = await getAllPartsRequests();
  return all.filter((r) => String(r.technicianId) === String(techId));
}

export async function savePartsRequest(req) {
  const all = await getAllPartsRequests();
  const next = [normalizePartsRequest(req), ...all];
  await AsyncStorage.setItem(TECH_PARTS_KEY, JSON.stringify(next));
}

export async function updatePartsRequestStatus(requestId, status) {
  const all = await getAllPartsRequests();
  const updated = all.map((r) =>
    String(r.id) === String(requestId)
      ? normalizePartsRequest({ ...r, status, updatedAt: new Date().toISOString() })
      : r,
  );
  await AsyncStorage.setItem(TECH_PARTS_KEY, JSON.stringify(updated));
}
