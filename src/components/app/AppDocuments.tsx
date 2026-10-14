import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  FolderOpen,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { defaultProvider } from '../../core/provider';
import { Document, ClassInfo } from '../../core/types';

interface AppDocumentsProps {
  classes: ClassInfo[];
  currentClassId?: string;
  onNavigate?: (route: string) => void;
}

export const AppDocuments: React.FC<AppDocumentsProps> = ({
  classes,
  currentClassId = 'cls-12a1',
  onNavigate,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load documents using provider
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const list = await defaultProvider.listDocumentsByClass(selectedClassId);
        setDocuments(list);
      } catch (err) {
        console.error('Failed to load documents for app', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedClassId]);

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'rules':
      case 'rule':
        return {
          label: 'Nội quy & Quy định',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: BookOpen,
        };
      case 'plans':
      case 'schedule':
        return {
          label: 'Kế hoạch & Thời khóa biểu',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Calendar,
        };
      case 'forms':
      case 'other':
        return {
          label: 'Biểu mẫu & Đơn từ',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: ClipboardList,
        };
      case 'curriculum':
      case 'exam':
        return {
          label: 'Đề cương & Tài liệu học tập',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: FileSpreadsheet,
        };
      default:
        return {
          label: 'Tài liệu chung',
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: FileText,
        };
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchCategory =
      selectedCategory === 'all' ||
      doc.category === selectedCategory ||
      (selectedCategory === 'rules' && doc.category === 'rule') ||
      (selectedCategory === 'plans' && doc.category === 'schedule') ||
      (selectedCategory === 'forms' && doc.category === 'other');
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q || doc.title.toLowerCase().includes(q) || (doc.url && doc.url.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Kho Lưu Trữ Tài Liệu & Đề Cương</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Tài Liệu, Kế Hoạch & Biểu Mẫu Lớp Học
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Tải về nội quy lớp, thời khóa biểu, đề cương ôn tập thi cử và các mẫu đơn hành chính được nhà trường phê duyệt.
            </p>
          </div>

          {/* Class Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col space-y-1">
            <span className="text-[11px] text-slate-300 font-semibold px-2">Lớp tài liệu:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-400 shadow-xs"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.classname || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({documents.length})
          </button>
          <button
            onClick={() => setSelectedCategory('rules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'rules'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Nội quy & Quy định
          </button>
          <button
            onClick={() => setSelectedCategory('plans')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'plans'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kế hoạch & TKB
          </button>
          <button
            onClick={() => setSelectedCategory('forms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'forms'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Biểu mẫu & Đơn
          </button>
          <button
            onClick={() => setSelectedCategory('curriculum')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'curriculum'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đề cương ôn tập
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          Đang tải kho tài liệu từ hệ thống...
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có tài liệu nào trong thư mục này</h3>
          <p className="text-xs text-slate-500 mt-1">
            Không tìm thấy tài liệu phù hợp theo danh mục được chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const cat = getCategoryDetails(doc.category);
            const CatIcon = cat.icon;
            const targetUrl = doc.url || doc.fileUrl || '#';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${cat.color}`}
                    >
                      <CatIcon className="h-3 w-3 mr-1" />
                      <span>{cat.label}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-300" />
                      {new Date(doc.createdAt || doc.uploadedAt || new Date()).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {doc.title}
                  </h3>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-3">
                    {doc.uploadedBy && <span>Đăng bởi: <strong>{doc.uploadedBy}</strong></span>}
                    {doc.fileSize && <span className="text-slate-400">• {doc.fileSize}</span>}
                  </div>
                </div>

                {/* View / Download button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px] font-mono">
                    {doc.url ? 'Tệp trực tuyến' : 'Tài liệu nội bộ'}
                  </span>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem & Tải về</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
