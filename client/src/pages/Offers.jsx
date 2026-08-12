import { useEffect, useState } from 'react';
import { FileText, Download, Pencil, Loader2 } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EditOfferModal from '../components/EditOfferModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime } from '../lib/utils.js';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOffer, setEditOffer] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      setOffers(res.data.offers);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusChange = async (id, status) => {
    setStatusLoading((p) => ({ ...p, [id]: status }));
    try {
      await api.patch(`/offers/${id}`, { status });
      await fetchOffers();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusLoading((p) => ({ ...p, [id]: '' }));
    }
  };

  const handleSave = async (id, data) => {
    await api.patch(`/offers/${id}`, data);
    await fetchOffers();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Client Offers</h2>
          <p className="text-slate-500 text-sm mt-1">Manage proposals and track deal status.</p>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-4">Offer ID</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">{offer.offerId}</td>
                    <td className="px-5 py-4 text-slate-700">{offer.clientName}</td>
                    <td className="px-5 py-4 text-slate-600">{offer.service}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{offer.amount}</td>
                    <td className="px-5 py-4">
                      {statusLoading[offer._id] ? (
                        <Loader2 size={14} className="animate-spin text-primary-600" />
                      ) : (
                        <select
                          value={offer.status}
                          onChange={(e) => handleStatusChange(offer._id, e.target.value)}
                          className="input py-1 px-2 w-auto text-xs"
                        >
                          {['draft', 'sent', 'accepted', 'completed', 'cancelled'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDateTime(offer.offerDate)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => setEditOffer(offer)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                          <Pencil size={16} />
                        </button>
                        {offer.pdfPath && (
                          <a href={`/api/offers/${offer._id}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-2">
                            <Download size={14} className="mr-1" /> PDF
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && <tr><td colSpan="7" className="py-10"><EmptyState message="No offers" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditOfferModal offer={editOffer} open={Boolean(editOffer)} onClose={() => setEditOffer(null)} onSave={handleSave} />
    </div>
  );
}
