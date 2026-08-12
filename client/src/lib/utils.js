export const statusLabel = (status) =>
  ({
    pending: 'Pending',
    contacted: 'Contacted',
    responded: 'Responded',
    no_response: 'No Response',
    closed_client: 'Closed Client',
  }[status] || status);

export const statusColor = (status) =>
  ({
    pending: 'bg-slate-100 text-slate-700 ring-slate-300',
    contacted: 'bg-blue-50 text-blue-700 ring-blue-200',
    responded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    no_response: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed_client: 'bg-violet-50 text-violet-700 ring-violet-200',
  }[status] || 'bg-slate-100 text-slate-700 ring-slate-300');

export const offerStatusColor = (status) =>
  ({
    draft: 'bg-slate-100 text-slate-700 ring-slate-300',
    sent: 'bg-blue-50 text-blue-700 ring-blue-200',
    accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    completed: 'bg-violet-50 text-violet-700 ring-violet-200',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
  }[status] || 'bg-slate-100 text-slate-700 ring-slate-300');

export const projectStatusColor = (status) =>
  ({
    active: 'bg-blue-50 text-blue-700 ring-blue-200',
    handed_over: 'bg-amber-50 text-amber-700 ring-amber-200',
    support: 'bg-violet-50 text-violet-700 ring-violet-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
  }[status] || 'bg-slate-100 text-slate-700 ring-slate-300');

export const followUpStatusColor = (status) =>
  ({
    open: 'bg-amber-50 text-amber-700 ring-amber-200',
    closed: 'bg-slate-100 text-slate-700 ring-slate-300',
    converted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }[status] || 'bg-slate-100 text-slate-700 ring-slate-300');

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export const formatDateForInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
