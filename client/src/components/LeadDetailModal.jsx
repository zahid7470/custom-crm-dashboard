import { useEffect, useState } from 'react';
import {
  Copy,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Code,
  FileText,
  Pencil,
  Loader2,
  Sparkles,
  Check,
  Send,
  Building,
  Tag,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import api from '../lib/api.js';
import { statusLabel, formatDateTime } from '../lib/utils.js';
import StatusBadge from './StatusBadge.jsx';
import Modal from './Modal.jsx';
import EditLeadModal from './EditLeadModal.jsx';
import { useToast } from '../context/ToastContext.jsx';

function JsonView({ data }) {
  const [raw, setRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const text = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Raw JSON copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setRaw(!raw)}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1.5 font-bold"
        >
          <Code className="w-3.5 h-3.5" /> {raw ? 'Show Structured Cards' : 'Show Raw JSON'}
        </button>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      {raw ? (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-auto max-h-96 text-xs font-mono border border-slate-800">
          {text}
        </pre>
      ) : (
        <div className="bg-slate-50 p-4 rounded-2xl overflow-auto max-h-96 text-sm border border-slate-200/80">
          <RenderObject data={data} />
        </div>
      )}
    </div>
  );
}

function RenderObject({ data }) {
  if (data === null || data === undefined) return <span className="text-slate-400">null</span>;
  if (typeof data !== 'object') return <span className="text-slate-900 font-medium">{String(data)}</span>;
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-5 space-y-1 text-slate-700">
        {data.map((item, i) => (
          <li key={i}>
            <RenderObject data={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-1.5">
          <span className="font-semibold text-slate-600 capitalize text-xs">{k.replace(/([A-Z])/g, ' $1')}:</span>
          <span className="col-span-2 text-xs">
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
  const [activeTab, setActiveTab] = useState('info');
  const [showEdit, setShowEdit] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!lead) return;
    setFullLead(null);
    setAnalysis(null);
    setEmail(null);
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
    const lres = await api.get(`/leads/${data._id}`);
    setFullLead(lres.data.lead);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingAction('analyzing');
    try {
      await api.post(`/leads/${data._id}/analyse`);
      await loadAnalysis();
      setActiveTab('analysis');
      toast.success('Website analysis completed successfully!');
      onUpdate && onUpdate();
    } catch (err) {
      toast.error(`Website analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleGenerateEmail = async () => {
    setLoading(true);
    setLoadingAction('email');
    try {
      const res = await api.post(`/leads/${data._id}/generate-email`);
      setEmail(res.data.email);
      setActiveTab('email');
      toast.success('AI personalized outreach email generated!');
    } catch (err) {
      toast.error(`Failed to generate email: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setLoadingAction('status');
    try {
      await api.patch(`/leads/${data._id}`, { status });
      toast.success(`Lead status moved to "${statusLabel(status)}".`);
      const lres = await api.get(`/leads/${data._id}`);
      setFullLead(lres.data.lead);
      onUpdate && onUpdate();
    } catch (err) {
      toast.error(`Status update failed: ${err.message}`);
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

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopiedEmail(true);
    toast.success('Cold email template copied to clipboard.');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const websiteUrl = data.website || data.sourceData?.website || data.sourceData?.contact?.website;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={data.businessName || data.name || 'Lead Details'}
        subtitle={`Sourced via ${data.source?.toUpperCase() || 'Direct'} on ${formatDateTime(data.createdAt)}`}
        size="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-3">
              <StatusBadge status={data.status} />
              <select
                value={data.status}
                onChange={handleStatusChange}
                className="input py-1.5 px-3 w-auto text-xs font-semibold cursor-pointer"
                disabled={loadingAction === 'status'}
              >
                {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {data.hasWebsite && (
                <button
                  onClick={handleAnalyze}
                  disabled={loadingAction === 'analyzing'}
                  className="btn-primary text-xs py-2 px-3"
                >
                  {loadingAction === 'analyzing' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {analysis ? 'Re-analyse Site' : 'AI Website Analysis'}
                </button>
              )}
              <button
                onClick={handleGenerateEmail}
                disabled={loadingAction === 'email'}
                className="btn-secondary text-xs py-2 px-3"
              >
                {loadingAction === 'email' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-primary-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                )}
                Generate AI Email
              </button>
              <button onClick={() => setShowEdit(true)} className="btn-secondary text-xs py-2 px-3">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {[
              { id: 'info', label: 'Lead Profile' },
              { id: 'analysis', label: `Website Audit ${analysis ? '(Ready)' : ''}` },
              { id: 'email', label: `AI Outreach Email ${email ? '(Ready)' : ''}` },
              { id: 'source', label: 'Raw Ingestion Meta' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 text-xs font-bold transition duration-150 relative ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Profile & Contact */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                  icon={<Phone className="w-4 h-4 text-sky-600" />}
                  label="Phone Number"
                  value={data.phone || 'Not available'}
                  link={data.phone ? `tel:${data.phone}` : null}
                />
                <InfoCard
                  icon={<Mail className="w-4 h-4 text-primary-600" />}
                  label="Email Address"
                  value={data.email || 'Not available'}
                  link={data.email ? `mailto:${data.email}` : null}
                />
                <InfoCard
                  icon={<Globe className="w-4 h-4 text-emerald-600" />}
                  label="Website URL"
                  value={websiteUrl || 'No website found'}
                  link={websiteUrl}
                  external
                />
                <InfoCard
                  icon={<MapPin className="w-4 h-4 text-rose-600" />}
                  label="Location"
                  value={[data.city, data.country].filter(Boolean).join(', ') || 'Unknown location'}
                />
                <InfoCard
                  icon={<Building className="w-4 h-4 text-slate-600" />}
                  label="Physical Address"
                  value={data.address || 'Not specified'}
                />
                <InfoCard
                  icon={<Tag className="w-4 h-4 text-violet-600" />}
                  label="Industry / Category"
                  value={data.category || 'General Business'}
                />
              </div>

              {data.notes && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">Internal Notes</p>
                  <p className="text-sm text-amber-950 whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: AI Website Analysis */}
          {activeTab === 'analysis' && (
            <div className="space-y-4 animate-fadeIn">
              {analysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-xs text-emerald-950 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Analyzed Target: <span className="font-bold">{analysis.url}</span>
                    </div>
                    <span className="text-xs text-emerald-800 font-medium">
                      Audited: {formatDateTime(analysis.analyzedAt)}
                    </span>
                  </div>
                  <JsonView data={analysis.response} />
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <Globe className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Website Audit Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the button below to crawl this lead's website and extract SEO gaps, design improvements, and value propositions.
                  </p>
                  {data.hasWebsite && (
                    <button
                      onClick={handleAnalyze}
                      disabled={loadingAction === 'analyzing'}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      {loadingAction === 'analyzing' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Audit Website with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Cold Outreach Email */}
          {activeTab === 'email' && (
            <div className="space-y-4 animate-fadeIn">
              {email ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Subject</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{email.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyEmail}
                          className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                        >
                          {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {copiedEmail ? 'Copied' : 'Copy Template'}
                        </button>
                        {data.email && (
                          <a
                            href={`mailto:${data.email}?subject=${encodeURIComponent(
                              email.subject
                            )}&body=${encodeURIComponent(email.body)}`}
                            className="btn-primary text-xs py-1.5 px-3 font-semibold"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" /> Open in Mail
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Email Body</p>
                      <div className="p-4 rounded-xl bg-slate-50 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans border border-slate-200/60">
                        {email.body}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Outreach Draft Generated</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Generate a high-converting personalized cold outreach email tailored to this lead's business and web presence.
                  </p>
                  <button
                    onClick={handleGenerateEmail}
                    disabled={loadingAction === 'email'}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {loadingAction === 'email' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Generate Cold Outreach Draft
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Raw Ingestion Meta */}
          {activeTab === 'source' && (
            <div className="space-y-4 animate-fadeIn">
              <JsonView data={data.sourceData || data} />
            </div>
          )}
        </div>
      </Modal>

      <EditLeadModal lead={data} open={showEdit} onClose={() => setShowEdit(false)} onSave={handleSave} />
    </>
  );
}

function InfoCard({ icon, label, value, link, external }) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        {link ? (
          <a
            href={link}
            target={external ? '_blank' : undefined}
            rel="noreferrer"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-0.5 truncate hover:underline"
          >
            <span className="truncate">{value}</span>
            {external && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
          </a>
        ) : (
          <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
