import { statusColor, offerStatusColor, projectStatusColor, followUpStatusColor, statusLabel } from '../lib/utils.js';

const variantMap = {
  lead: statusColor,
  offer: offerStatusColor,
  project: projectStatusColor,
  followup: followUpStatusColor,
};

export default function StatusBadge({ status, type = 'lead', label, size = 'sm' }) {
  const colorFn = variantMap[type] || statusColor;
  const config = colorFn(status);

  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset border shadow-xs transition-all ${
        config.bg
      } ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${config.dot}`} />
      {label || statusLabel(status) || status}
    </span>
  );
}
