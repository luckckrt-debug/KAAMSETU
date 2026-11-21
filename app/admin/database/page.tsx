'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Table, 
  Code, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  FolderTree,
  X,
  FileJson,
  Layers,
  ArrowRight
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function DatabaseExplorerPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('users');
  const [collectionData, setCollectionData] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loadingCols, setLoadingCols] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [viewDocModal, setViewDocModal] = useState<any | null>(null);
  const [editDocModal, setEditDocModal] = useState<{ open: boolean; doc: any; rawJson: string; reason: string }>({
    open: false,
    doc: null,
    rawJson: '',
    reason: '',
  });

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/admin/database');
      const data = await res.json();
      if (data.success && Array.isArray(data.collections)) {
        setCollections(data.collections);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCols(false);
    }
  };

  const fetchCollectionDocuments = async (col = selectedCollection, p = page, q = search) => {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/admin/database?collection=${col}&page=${p}&limit=20&search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setCollectionData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchCollectionDocuments(selectedCollection, page, search);
  }, [selectedCollection, page]);

  const handleSelectCollection = (colName: string) => {
    setSelectedCollection(colName);
    setPage(1);
    setSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCollectionDocuments(selectedCollection, 1, search);
  };

  const handleSaveDocEdit = async () => {
    if (!editDocModal.doc || !editDocModal.reason.trim()) {
      alert('A reason is required to edit database documents.');
      return;
    }

    try {
      const parsed = JSON.parse(editDocModal.rawJson);
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: selectedCollection,
          documentId: editDocModal.doc.id || editDocModal.doc._id,
          updatedDoc: parsed,
          reason: editDocModal.reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditDocModal({ open: false, doc: null, rawJson: '', reason: '' });
        fetchCollectionDocuments();
        alert('Document updated successfully.');
      } else {
        alert(data.error || 'Failed to update document.');
      }
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  return (
    <AdminLayout
      title="MongoDB Atlas Database Explorer"
      subtitle="डेटाबेस एक्सप्लोरर • Live collection inspector, document browser, schema analyzer & audit trail"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atlas: DigiWork Central DB (Connected)</span>
          </div>
          <button
            onClick={() => { fetchCollections(); fetchCollectionDocuments(); }}
            className="p-2 rounded-xl border border-[#D1E8F8] bg-white hover:bg-[#F5FAFF] text-[#153451] transition"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4 text-[#2583D5]" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left: Collections Sidebar List */}
        <div className="bg-white rounded-3xl p-5 border border-[#D1E8F8] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
            <span className="text-xs font-black uppercase text-[#153451] tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-[#2583D5]" />
              <span>Collections ({collections.length})</span>
            </span>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-1 divide-y divide-[#EAF6FF] text-xs">
            {loadingCols ? (
              <div className="p-4 text-center text-[#7697B3]">Loading collections...</div>
            ) : (
              collections.map((col) => {
                const isSelected = selectedCollection === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleSelectCollection(col.name)}
                    className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between font-bold transition text-left ${
                      isSelected
                        ? 'bg-[#2583D5] text-white shadow-xs'
                        : 'text-[#4B6F8E] hover:text-[#153451] hover:bg-[#F5FAFF]'
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF6FF] text-[#2583D5]'
                    }`}>
                      {col.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Collection Records Browser */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-sm space-y-5">
          
          {/* Collection Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAF6FF] pb-4">
            <div>
              <h2 className="text-lg font-black text-[#153451] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#2583D5]" />
                <span className="font-mono">{selectedCollection}</span>
                <span className="text-xs font-bold text-[#7697B3]">
                  ({collectionData ? collectionData.total : 0} documents)
                </span>
              </h2>
              {collectionData?.fields && (
                <p className="text-[11px] text-[#7697B3] mt-1 truncate">
                  Schema Fields: {collectionData.fields.slice(0, 8).join(', ')}...
                </p>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#7697B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collection documents..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none focus:border-[#2583D5]"
              />
            </form>
          </div>

          {/* Documents Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5FAFF] border-b border-[#EAF6FF] text-[10px] font-black uppercase text-[#7697B3]">
                  <th className="py-2.5 px-3">_id / id</th>
                  <th className="py-2.5 px-3">Identifier / Title</th>
                  <th className="py-2.5 px-3">Status / Role</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF6FF]">
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#7697B3] font-semibold">
                      Querying MongoDB Atlas collection...
                    </td>
                  </tr>
                ) : !collectionData || collectionData.documents?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#7697B3] font-semibold">
                      No documents found in collection &quot;{selectedCollection}&quot;.
                    </td>
                  </tr>
                ) : (
                  collectionData.documents.map((doc: any, idx: number) => {
                    const docId = doc.id || String(doc._id);
                    const name = doc.fullName || doc.title || doc.serviceCategory || doc.companyName || doc.action || docId;
                    const status = doc.status || doc.verificationStatus || doc.payoutSchedule || 'OK';

                    return (
                      <tr key={docId || idx} className="hover:bg-[#F5FAFF] transition font-medium">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#2583D5] font-bold">
                          {docId.slice(0, 18)}
                        </td>

                        <td className="py-3 px-3 font-bold text-[#153451] max-w-[200px] truncate">
                          {name}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#EAF6FF] text-[#2583D5] border border-[#D1E8F8]">
                            {status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[11px] text-[#7697B3]">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewDocModal(doc)}
                              className="px-2.5 py-1 rounded-lg border border-[#D1E8F8] bg-white hover:bg-[#EAF6FF] text-[#2583D5] font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <FileJson className="w-3 h-3" />
                              <span>View JSON</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditDocModal({
                                open: true,
                                doc,
                                rawJson: JSON.stringify(doc, null, 2),
                                reason: '',
                              })}
                              className="px-2.5 py-1 rounded-lg bg-[#F5FAFF] hover:bg-[#EAF6FF] text-[#153451] font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-[#7697B3]" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {collectionData && collectionData.totalPages > 1 && (
            <div className="pt-3 border-t border-[#EAF6FF] flex items-center justify-between text-xs font-bold text-[#7697B3]">
              <span>Page {collectionData.page} of {collectionData.totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= collectionData.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-xl border border-[#D1E8F8] bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: VIEW JSON DOCUMENT */}
      {viewDocModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
              <span className="font-mono font-bold text-xs text-[#2583D5]">
                {selectedCollection} / {viewDocModal.id || viewDocModal._id}
              </span>
              <button
                type="button"
                onClick={() => setViewDocModal(null)}
                className="p-1 rounded-lg hover:bg-[#F5FAFF] text-[#7697B3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-4 rounded-2xl bg-[#0D1D2D] text-emerald-400 font-mono text-[11px] leading-relaxed select-all">
              {JSON.stringify(viewDocModal, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDocModal(null)}
                className="px-4 py-2 rounded-xl bg-[#2583D5] text-white text-xs font-bold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DOCUMENT */}
      {editDocModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 border border-[#D1E8F8] shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#EAF6FF] pb-3">
              <h3 className="font-black text-sm text-[#153451]">
                Edit Document ({selectedCollection})
              </h3>
              <button
                type="button"
                onClick={() => setEditDocModal({ open: false, doc: null, rawJson: '', reason: '' })}
                className="p-1 rounded-lg hover:bg-[#F5FAFF] text-[#7697B3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
              <label className="text-[11px] font-black uppercase text-[#7697B3]">Raw Document JSON</label>
              <textarea
                value={editDocModal.rawJson}
                onChange={(e) => setEditDocModal({ ...editDocModal, rawJson: e.target.value })}
                rows={12}
                className="w-full flex-1 p-3 rounded-2xl border border-[#D1E8F8] bg-[#0D1D2D] text-emerald-400 font-mono text-xs focus:outline-none"
              />

              <div>
                <label className="text-[11px] font-black uppercase text-[#7697B3] block mb-1">
                  Mandatory Audit Reason (Why is this record being edited?)
                </label>
                <input
                  type="text"
                  value={editDocModal.reason}
                  onChange={(e) => setEditDocModal({ ...editDocModal, reason: e.target.value })}
                  placeholder="e.g. Corrected address typo requested by customer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1E8F8] bg-[#F5FAFF] text-xs font-semibold text-[#153451] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAF6FF]">
              <button
                type="button"
                onClick={() => setEditDocModal({ open: false, doc: null, rawJson: '', reason: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7697B3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocEdit}
                className="px-5 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-black shadow-md transition"
              >
                Save Changes to MongoDB Atlas
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
