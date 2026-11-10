import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { Catalog } from '../types';
import { exportAllCatalogsBackup, importCatalogsBackup } from '../db/storage';

interface CatalogListModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogs: Catalog[];
  currentCatalogId: string;
  onSelectCatalog: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onRefreshList: () => void;
}

export const CatalogListModal: React.FC<CatalogListModalProps> = ({
  isOpen,
  onClose,
  catalogs,
  currentCatalogId,
  onSelectCatalog,
  onCreateNew,
  onDuplicate,
  onDelete,
  onRename,
  onRefreshList,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRename = (cat: Catalog) => {
    setEditingId(cat.id);
    setEditTitle(cat.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportBackup = async () => {
    try {
      setStatusMessage('Exporting backup package...');
      const backup = await exportAllCatalogsBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalog-express-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatusMessage('Backup exported successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage('Export failed: ' + err.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setStatusMessage('Importing backup data...');
        const json = JSON.parse(event.target?.result as string);
        const count = await importCatalogsBackup(json);
        onRefreshList();
        setStatusMessage(`Successfully imported ${count} catalogue(s)!`);
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err: any) {
        setStatusMessage('Import error: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              Manage Catalogues
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Switch between collections, duplicate, or backup your catalogues</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 font-semibold">
            {statusMessage}
          </div>
        )}

        {/* Catalogues List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {catalogs.map((cat) => {
            const isActive = cat.id === currentCatalogId;
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(cat.id)}
                        className="px-2.5 py-1 text-sm bg-white border border-blue-600 rounded-lg text-slate-900 focus:outline-none w-full max-w-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(cat.id)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectCatalog(cat.id);
                          onClose();
                        }}
                        className="text-left font-bold text-sm text-slate-900 hover:text-blue-600 truncate"
                      >
                        {cat.title}
                      </button>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          Active
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                      {cat.products.length} {cat.products.length === 1 ? 'product' : 'products'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(cat.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleStartRename(cat)}
                      className="text-blue-600 hover:text-blue-800 underline text-[11px] font-medium"
                    >
                      Rename
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {confirmDeleteId === cat.id ? (
                    <div className="flex items-center gap-1.5 animate-fade-in bg-rose-50 p-1 px-2 rounded-lg border border-rose-200">
                      <span className="text-[11px] font-bold text-rose-700">Delete?</span>
                      <button
                        onClick={async () => {
                          setConfirmDeleteId(null);
                          await onDelete(cat.id);
                          onRefreshList();
                        }}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                        title="Confirm Delete"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectCatalog(cat.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Open
                        </button>
                      )}
                      <button
                        onClick={() => onDuplicate(cat.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Duplicate Catalogue"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {catalogs.length > 1 && (
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Catalogue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
              title="Download all catalogues and images as a .json backup file"
            >
              <Download className="w-3.5 h-3.5" />
              Backup All (.json)
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Catalogue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
