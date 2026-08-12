import { useEffect, useState } from 'react';
import { Copy, Globe, Mail, Phone, MapPin, ExternalLink, Code, FileText, Pencil, Loader2 } from 'lucide-react';
import api from '../lib/api.js';
import { statusLabel, formatDateTime } from '../lib/utils.js';
import StatusBadge from './StatusBadge.jsx';
import Modal from './Modal.jsx';
import EditLeadModal from './EditLeadModal.jsx';

function JsonView({ data }) {
  const [raw, setRaw] = useState(false);
  const text = JSON.stringify(data, null, 2);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setRaw(!raw)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
        >
          <Code size={14} /> {raw ? 'Structured' : 'Raw JSON'}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
        >
          <Copy size={14} /> Copy JSON
        </button>
      </div>
      {raw ? (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-auto max-h-80 text-xs font-mono">{text}</pre>
      ) : (
        <div className="bg-slate-50 p-4 rounded-xl overflow-auto max-h-80 text-sm border border-slate-100">
          <RenderObject data={data} />
        </div>
      )}
    </div>
  );
}

function RenderObject({ data }) {
  if (data === null || data === undefined) return <span className="text-slate-400">null</span>;
  if (typeof data !== 'object') return <span>{String(data)}</span>;
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {data.map((item, i) => (
          <li key={i}>
            <RenderObject data={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="grid grid-cols-3 gap-2">
          <span className="font-medium text-slate-600 capitalize">{k}:</span>
          <span className="col-span-2">
            <RenderObject data={v} />
          </span>
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
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setFullLead(null);
    setAnalysis(null);
    setEmail(null);
    setError('');
    setActiveTab('info');

    api.get(`/leads/${lead._id}`).then(async (res) => {
      const l = res.data.lead;
      setFullLead(l);
      if (l.websiteAnalysis?.analyzed || l.websiteAnalysis?.analysisId) {
        try {
          const ares = await api.get(`/leads/${lead._id}/analysis`);
          setAnalysis(ares.data.analysis);
        } catch (e) {
          console.error('Failed to load analysis', e);
        }
      }
    });
  }, [lead]);

  if (!lead || !open) return null;

  const data = fullLead || lead;

  const loadAnalysis = async () => {
    const res = await api.get(`/leads/${data._id}/analysis`);
    if (res?.data?.analysis) {
      setAnalysis(res.data.analysis);
    }
    // refresh lead details too
    const lres = await api.get(`/leads/${data._id}`);
    setFullLead(lres.data.lead);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingAction('analyzing');
    setError('');
    try {
      await api.post(`/leads/${data._id}/analyse`);
      await loadAnalysis();
      setActiveTab('analysis');
      onUpdate && onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleGenerateEmail = async () => {
    setLoading(true);
    setLoadingAction('email');
    setError('');
    try {
      const res = await api.post(`/leads/${data._id}/generate-email`);
      setEmail(res.data.email);
      setActiveTab('email');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setLoadingAction('status');
    setError('');
    try {
      await api.patch(`/leads/${data._id}`, { status });
      onUpdate && onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleSave = async (id, form) => {
    await api.patch(`/leads/${id}`, form);
    onUpdate && onUpdate();
    const lres = await api.get(`/leads/${id}`);
    setFullLead(lres.data.lead);
  };

  const websiteUrl = data.website || data.sourceData?.website || data.sourceData?.contact?.website;

  const ActionButton = ({ onClick, disabled, icon: Icon, loadingType, children, variant = 'primary' }) => {
    const busy = loadingAction === loadingType;
    const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
    return (
      <button onClick={onClick} disabled={disabled || busy} className={`${base} text-xs`}>
        {busy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Icon size={14} className="mr-1" />}
        {children}
      </button>
    );
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={data.businessName || data.name || 'Lead Details'} size="max-w-4xl">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={data.status} />
            <select value={data.status} onChange={handleStatusChange} className="input py-1.5 px-3 w-auto" disabled={loadingAction === 'status'}>
              {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            {data.hasWebsite && (
              <ActionButton onClick={handleAnalyze} loadingType="analyzing" icon={Globe}>
                {analysis ? 'Re-analyse Website' : 'Analyse Website'}
              </ActionButton>
            )}
            <ActionButton onClick={handleGenerateEmail} loadingType="email" icon={Mail} variant="secondary">
              Generate Email
            </ActionButton>
            <button onClick={() => setShowEdit(true)} className="btn-secondary text-xs">
              <Pencil size={14} className="mr-1" /> Edit Lead
            </button>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="flex gap-2 border-b border-slate-100">
            {['info', 'analysis', 'email', 'source'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-2 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
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
                  <div className="flex gap-4 text-sm text-slate-600 mb-3">
                    <p>
                      <span className="font-medium">URL:</span> {analysis.url}
                    </p>
                    <p>
                      <span className="font-medium">Analyzed:</span> {formatDateTime(analysis.analyzedAt)}
                    </p>
                  </div>
                  <JsonView data={analysis.response} />
                </>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500">No analysis available. Click "Analyse Website" to run.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              {email ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-slate-800">Subject: {email.subject}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${email.subject}\n\n${email.body}`)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                    >
                      <Copy size={14} /> Copy Email
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm whitespace-pre-wrap border border-slate-100">{email.body}</div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500">No email generated yet. Click "Generate Email".</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'source' && <JsonView data={data.sourceData} />}
        </div>
      </Modal>

      <EditLeadModal lead={data} open={showEdit} onClose={() => setShowEdit(false)} onSave={handleSave} />
    </>
  );
}

function InfoRow({ icon, label, value, link }) {
  const content = link ? (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
    >
      {value} <ExternalLink size={12} />
    </a>
  ) : (
    <span className="text-slate-900">{value}</span>
  );
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-primary-500 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        {content}
      </div>
    </div>
  );
}
