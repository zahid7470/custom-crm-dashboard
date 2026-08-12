import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDateTime } from '../lib/utils.js';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/offers').then((res) => setOffers(res.data.offers)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/offers/${id}`, { status });
      const res = await api.get('/offers');
      setOffers(res.data.offers);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Client Offers</h2>
        <p className="text-sm text-gray-500">Create offers from the Leads page.</p>
      </div>

      {loading ? <Loading /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Offer ID</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{offer.offerId}</td>
                  <td className="px-4 py-3">{offer.clientName}</td>
                  <td className="px-4 py-3 text-gray-600">{offer.service}</td>
                  <td className="px-4 py-3">{offer.amount}</td>
                  <td className="px-4 py-3">
                    <select
                      value={offer.status}
                      onChange={(e) => handleStatusChange(offer._id, e.target.value)}
                      className="input py-1 px-2 w-auto text-xs"
                    >
                      {['draft', 'sent', 'accepted', 'completed', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(offer.offerDate)}</td>
                  <td className="px-4 py-3 text-right">
                    {offer.pdfPath && (
                      <a href={`/api/offers/${offer._id}/pdf`} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 text-xs">
                        <Download size={14} /> PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {offers.length === 0 && <tr><td colSpan="7" className="py-8"><EmptyState message="No offers" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
