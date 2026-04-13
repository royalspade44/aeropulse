/**
 * Summarizes technician workload for the dashboard (client-side hints; full auto-assign lives server-side).
 * @param {{ tasks?: Array }} props
 */
function TechDispatchMetrics({ tasks = [] }) {
  const list = Array.isArray(tasks) ? tasks : [];

  const processingSchedules = list.filter((t) =>
    ['scheduled', 'processing', 'assigned'].includes(String(t.status || '').toLowerCase())
  ).length;

  const waitingQueue = list.filter((t) => String(t.status || '').toLowerCase() === 'processing').length;

  const failuresReported = list.filter((t) => t.failureReported || t.customerIssue === 'failure').length;

  const completedRepairs = list.filter((t) =>
    ['completed', 'closed', 'done'].includes(String(t.status || '').toLowerCase())
  ).length;

  return (
    <div className="tech-dispatch-metrics">
      <div className="tech-dispatch-metric">
        <span className="tech-dispatch-label">Processing schedules</span>
        <strong>{processingSchedules}</strong>
      </div>
      <div className="tech-dispatch-metric">
        <span className="tech-dispatch-label">Waiting in queue</span>
        <strong>{waitingQueue}</strong>
      </div>
      <div className="tech-dispatch-metric">
        <span className="tech-dispatch-label">Failures reported</span>
        <strong>{failuresReported}</strong>
      </div>
      <div className="tech-dispatch-metric">
        <span className="tech-dispatch-label">Completed / closed</span>
        <strong>{completedRepairs}</strong>
      </div>
    </div>
  );
}

export default TechDispatchMetrics;
