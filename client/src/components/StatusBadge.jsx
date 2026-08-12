import { statusColor, statusLabel } from '../lib/utils.js';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusColor(status)}`}>{statusLabel(status)}</span>
  );
}
