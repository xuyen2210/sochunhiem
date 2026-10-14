import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { defaultProvider } from '../../core/provider';
import { Announcement, ClassInfo } from '../../core/types';

interface AppAnnouncementsProps {
  classes: ClassInfo[];
  currentClassId?: string;
  onNavigate?: (route: string) => void;
}

export const AppAnnouncements: React.FC<AppAnnouncementsProps> = ({
  classes,
  currentClassId = 'cls-12a1',
  onNavigate,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [targetFilter, setTargetFilter] = useState<'all' | 'parent' | 'student'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load announcements using provider
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const list = await defaultProvider.listAnnouncementsByClass(selectedClassId);
        setAnnouncements(list);
      } catch (err) {
        console.error('Failed to load announcements for app', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedClassId]);

  // Filter and sort (pinned prioritized to top)
  const filteredAnnouncements = announcements
    .filter((a) => {
      const matchTarget = targetFilter === 'all' || a.target === 'all' || a.target === targetFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      return matchTarget && matchSearch;
    })
    .sort((a, b) => {
      const aPinned = !!(a.pinned ?? a.isPinned);
      const bPinned = !!(b.pinned ?? b.isPinned);
      // Pinned items strictly on top
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  const pinnedCount = filteredAnnouncements.filter((a) => !!(a.pinned ?? a.isPinned)).length;

  const getTargetBadge = (tgt?: string) => {
    switch (tgt) {
      case 'parent':
        return { label: 'Dành cho Phụ huynh', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'student':
        return { label: 'Dành cho Học sinh', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Toàn thể lớp học', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Bảng Tin Điện Tử Lớp Học</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Bảng Tin & Thông Báo Chính Thức
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Cập nhật thông tin nhanh chóng từ Giáo viên Chủ nhiệm và Nhà trường. Các thông báo quan trọng được ghim ưu tiên hiển thị đầu tiên.
            </p>
          </div>

          {/* Class Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col space-y-1">
            <span className="text-[11px] text-blue-200 font-semibold px-2">Chọn lớp xem tin:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-white shadow-xs"
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Target Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTargetFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'all'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTargetFilter('parent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'parent'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phụ huynh
          </button>
          <button
            onClick={() => setTargetFilter('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'student'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Học sinh
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          Đang tải thông báo từ hệ thống...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có thông báo nào</h3>
          <p className="text-xs text-slate-500 mt-1">
            Không tìm thấy thông báo phù hợp trong lớp này.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const isPinned = !!(ann.pinned ?? ann.isPinned);
            const badge = getTargetBadge(ann.target);

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-2xs transition-all ${
                  isPinned
                    ? 'border-red-300 ring-2 ring-red-100 bg-gradient-to-r from-red-50/20 via-white to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    {isPinned && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-2xs animate-pulse">
                        <Pin className="h-3 w-3" />
                        <span>ĐÃ GHIM LÊN ĐẦU</span>
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(ann.createdAt).toLocaleDateString('vi-VN')} {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {ann.title}
                </h2>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {/* Footer Sender Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    Người gửi: <strong>{ann.authorName || 'Thầy Nguyễn Văn Xuyên'}</strong> ({ann.authorRole || 'GVCN'})
                  </span>
                  <span className="text-blue-600 font-medium">
                    Hệ thống thông báo điện tử EduMaster
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
