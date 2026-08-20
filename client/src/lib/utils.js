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
    pending: {
      bg: 'bg-amber-50 text-amber-700 ring-amber-200/80 border-amber-200/50',
      dot: 'bg-amber-500',
    },
    contacted: {
      bg: 'bg-sky-50 text-sky-700 ring-sky-200/80 border-sky-200/50',
      dot: 'bg-sky-500',
    },
    responded: {
      bg: 'bg-indigo-50 text-indigo-700 ring-indigo-200/80 border-indigo-200/50',
      dot: 'bg-indigo-500',
    },
    no_response: {
      bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
      dot: 'bg-slate-400',
    },
    closed_client: {
      bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80 border-emerald-200/50',
      dot: 'bg-emerald-500',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
    dot: 'bg-slate-400',
  });

export const offerStatusColor = (status) =>
  ({
    draft: {
      bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
      dot: 'bg-slate-400',
    },
    sent: {
      bg: 'bg-sky-50 text-sky-700 ring-sky-200/80 border-sky-200/50',
      dot: 'bg-sky-500',
    },
    accepted: {
      bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80 border-emerald-200/50',
      dot: 'bg-emerald-500',
    },
    completed: {
      bg: 'bg-purple-50 text-purple-700 ring-purple-200/80 border-purple-200/50',
      dot: 'bg-purple-500',
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-700 ring-rose-200/80 border-rose-200/50',
      dot: 'bg-rose-500',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
    dot: 'bg-slate-400',
  });

export const projectStatusColor = (status) =>
  ({
    active: {
      bg: 'bg-blue-50 text-blue-700 ring-blue-200/80 border-blue-200/50',
      dot: 'bg-blue-500',
    },
    handed_over: {
      bg: 'bg-amber-50 text-amber-700 ring-amber-200/80 border-amber-200/50',
      dot: 'bg-amber-500',
    },
    support: {
      bg: 'bg-purple-50 text-purple-700 ring-purple-200/80 border-purple-200/50',
      dot: 'bg-purple-500',
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80 border-emerald-200/50',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-700 ring-rose-200/80 border-rose-200/50',
      dot: 'bg-rose-500',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
    dot: 'bg-slate-400',
  });

export const followUpStatusColor = (status) =>
  ({
    open: {
      bg: 'bg-amber-50 text-amber-700 ring-amber-200/80 border-amber-200/50',
      dot: 'bg-amber-500',
    },
    closed: {
      bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
      dot: 'bg-slate-400',
    },
    converted: {
      bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80 border-emerald-200/50',
      dot: 'bg-emerald-500',
    },
  }[status] || {
    bg: 'bg-slate-100 text-slate-700 ring-slate-200/80 border-slate-200/50',
    dot: 'bg-slate-400',
  });

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatDateForInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};
