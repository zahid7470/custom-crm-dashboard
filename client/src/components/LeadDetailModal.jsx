import { useEffect, useState } from 'react';
import { X, Copy, Globe, Mail, Phone, MapPin, ExternalLink, Code, FileText } from 'lucide-react';
import api from '../lib/api.js';
import { statusLabel, formatDateTime } from '../lib/utils.js';
import StatusBadge from './StatusBadge.jsx';
import Modal from './Modal.jsx';

function JsonView({ data }) {
  const [raw, setRaw] = useState(false);
  const text = JSON.stringify(data, null, 2);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setRaw(!raw)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
          <Code size={14} /> {raw ? 'Structured' : 'Raw JSON'}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
        >
          <Copy size={14} /> Copy JSON
        </button>
      </div>
      {raw ? (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-80 text-xs">{text}</pre>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80 text-sm">
          <RenderObject data={data} />
        </div>
      )}
    </div>
  );
}

function RenderObject({ data }) {
  if (data === null || data === undefined) return <span className="text-gray-400">null</span>;
  if (typeof data !== 'object') return <span>{String(data)}</span>;
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {data.map((item, i) => (
          <li key={i}><RenderObject data={item} /></li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="grid grid-cols-3 gap-2">
          <span className="font-medium text-gray-600 capitalize">{k}:</span>
          <span className="col-span-2"><RenderObject data={v} /></span>
        </div>
      ))}
    </div>
  );
}

export default function LeadDetailModal({ lead, open, onClose, onUpdate }) {
  const [fullLead, setFullLead] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!lead) return;
    setFullLead(null);
    setAnalysis(null);
    setEmail(null);
    setError('');
    setActiveTab('info');
    api.get(`/leads/${lead._id}`).then((res) => setFullLead(res.data.lead));
  }, [lead]);

  if (!lead || !open) return null;

  const data = fullLead || lead;

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/leads/${data._id}/analyse`);
      const res = await api.get(`/leads/${data._id}/analysis`);
      setAnalysis(res.data.analysis);
      setActiveTab('analysis');
      onUpdate && onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/leads/${data._id}/generate-email`);
      setEmail(res.data.email);
      setActiveTab('email');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    try {
      await api.patch(`/leads/${data._id}`, { status });
      onUpdate && onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const websiteUrl = data.website || (data.sourceData?.website) || (data.sourceData?.contact?.website);

  return (
    <Modal open={open} onClose={onClose} title={data.businessName || data.name || 'Lead Details'}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <StatusBadge status={data.status} />
          <select
            value={data.status}
            onChange={handleStatusChange}
            className="input py-1 px-2 w-auto"
          >
            {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          {data.hasWebsite && (
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary text-xs">
              <Globe size={14} className="mr-1" /> Analyse Website
            </button>
          )}
          <button onClick={handleGenerateEmail} disabled={loading} className="btn-secondary text-xs">
            <Mail size={14} className="mr-1" /> Generate Email
          </button>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <div className="flex gap-4 border-b border-gray-200">
          {['info', 'analysis', 'email', 'source'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <InfoRow icon={<Phone size={14} />} label="Phone" value={data.phone || '-'} />
            <InfoRow icon={<Mail size={14} />} label="Email" value={data.email || '-'} />
            <InfoRow icon={<Globe size={14} />} label="Website" value={websiteUrl || '-'} link={websiteUrl} />
            <InfoRow icon={<MapPin size={14} />} label="Location" value={[data.city, data.country].filter(Boolean).join(', ') || '-'} />
            <InfoRow icon={<FileText size={14} />} label="Address" value={data.address || '-'} />
            <InfoRow icon={<FileText size={14} />} label="Category" value={data.category || '-'} />
            <InfoRow icon={<FileText size={14} />} label="Source" value={data.source} />
            <InfoRow icon={<FileText size={14} />} label="Imported" value={formatDateTime(data.createdAt)} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            {analysis ? (
              <>
                <p className="text-sm text-gray-600 mb-2">URL: {analysis.url}</p>
                <p className="text-sm text-gray-600 mb-2">Analyzed: {formatDateTime(analysis.analyzedAt)}</p>
                <JsonView data={analysis.response} />
              </>
            ) : (
              <p className="text-sm text-gray-500">No analysis available. Click "Analyse Website" to run.</p>
            )}
          </div>
        )}

        {activeTab === 'email' && (
          <div>
            {email ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">Subject: {email.subject}</p>
                  <button onClick={() => navigator.clipboard.writeText(`${email.subject}\n\n${email.body}`)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    <Copy size={14} /> Copy Email
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">{email.body}</div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email generated yet. Click "Generate Email".</p>
            )}
          </div>
        )}

        {activeTab === 'source' && (
          <JsonView data={data.sourceData} />
        )}
      </div>
    </Modal>
  );
}

function InfoRow({ icon, label, value, link }) {
  const content = link ? (
    <a href={link} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-1">
      {value} <ExternalLink size={12} />
    </a>
  ) : (
    <span className="text-gray-900">{value}</span>
  );
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        {content}
      </div>
    </div>
  );
}
