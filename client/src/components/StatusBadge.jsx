import { statusColor, offerStatusColor, projectStatusColor, followUpStatusColor, statusLabel } from '../lib/utils.js';

const variantMap = {
  lead: statusColor,
  offer: offerStatusColor,
  project: projectStatusColor,
  followup: followUpStatusColor,
};

export default function StatusBadge({ status, type = 'lead', label }) {
  const colorFn = variantMap[type] || statusColor;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${colorFn(
        status
      )}`}
    >
      {label || statusLabel(status) || status}
    </span>
  );
}
