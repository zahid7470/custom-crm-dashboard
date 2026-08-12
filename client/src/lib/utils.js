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
    pending: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    responded: 'bg-green-100 text-green-800',
    no_response: 'bg-yellow-100 text-yellow-800',
    closed_client: 'bg-purple-100 text-purple-800',
  }[status] || 'bg-gray-100 text-gray-800');

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};
