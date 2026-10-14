import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  Calendar,
  Eye,
  Users,
  Search,
  CheckCircle2,
  Filter,
  AlertCircle,
  X,
} from 'lucide-react';
import { Announcement, ClassInfo } from '../../core/types';

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  classes: ClassInfo[];
  currentClassId: string;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAnnouncement: (id: string, patch: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onTogglePinAnnouncement: (id: string) => Promise<void>;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  announcements,
  classes,
  currentClassId,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onTogglePinAnnouncement,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || 'all');
  const [targetFilter, setTargetFilter] = useState<'all' | 'parent' | 'student'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [classId, setClassId] = useState(currentClassId || 'cls-12a1');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'parent' | 'student' | 'all'>('all');
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setClassId(selectedClassId === 'all' ? (classes[0]?.id || 'cls-12a1') : selectedClassId);
    setTitle('');
    setContent('');
    setTarget('all');
    setPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setClassId(item.classId || classes[0]?.id || 'cls-12a1');
    setTitle(item.title);
    setContent(item.content);
    setTarget(item.target || 'all');
    setPinned(!!(item.pinned ?? item.isPinned));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await onUpdateAnnouncement(editingItem.id, {
          classId,
          title: title.trim(),
          content: content.trim(),
          target,
          pinned,
          isPinned: pinned,
        });
        showToast('Đã cập nhật thông báo thành công!');
      } else {
        await onAddAnnouncement({
          classId,
          title: title.trim(),
          content: content.trim(),
          target,
          pinned,
          isPinned: pinned,
          authorName: 'Thầy Nguyễn Văn Xuyên',
          authorRole: 'GVCN Lớp 12A1',
          viewCount: 0,
        });
        showToast('Đã đăng thông báo mới thành công!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save announcement', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thông báo "${titleStr}"?`)) {
      await onDeleteAnnouncement(id);
      showToast('Đã xóa thông báo thành công!');
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    await onTogglePinAnnouncement(id);
    showToast(currentPinStatus ? 'Đã bỏ ghim thông báo!' : 'Đã ghim thông báo lên đầu trang!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter list
  const filteredAnnouncements = announcements
    .filter((a) => {
      const matchClass = selectedClassId === 'all' || a.classId === selectedClassId;
      const matchTarget = targetFilter === 'all' || a.target === targetFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
      return matchClass && matchTarget && matchSearch;
    })
    .sort((a, b) => {
      const aPinned = !!(a.pinned ?? a.isPinned);
      const bPinned = !!(b.pinned ?? b.isPinned);
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  const getTargetBadge = (tgt?: string) => {
    switch (tgt) {
      case 'parent':
        return { label: 'Phụ huynh', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'student':
        return { label: 'Học sinh', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Tất cả (Phụ huynh & HS)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <span>Quản Lý Bảng Tin & Thông Báo Lớp Học</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module CRUD Announcements: Tạo, sửa, xóa, gắn cờ ghim (pinned) ưu tiên và phân quyền đối tượng
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Thông Báo Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.classname || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span className="font-semibold">Đối tượng:</span>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="parent">Phụ huynh</option>
              <option value="student">Học sinh</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Chưa có thông báo nào phù hợp</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy tạo thông báo mới hoặc điều chỉnh bộ lọc lớp và đối tượng nhận tin.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Tạo thông báo ngay
            </button>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isPinned = !!(ann.pinned ?? ann.isPinned);
            const targetBadge = getTargetBadge(ann.target);
            const targetClass = classes.find((c) => c.id === ann.classId);

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all ${
                  isPinned
                    ? 'border-red-300 ring-2 ring-red-50 bg-red-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    {/* Pin status badge */}
                    {isPinned ? (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-2xs">
                        <Pin className="h-3 w-3" />
                        <span>ĐÃ GHIM ĐẦU TRANG</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                        Tin thường
                      </span>
                    )}

                    {/* Target badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${targetBadge.color}`}>
                      {targetBadge.label}
                    </span>

                    {/* Class badge */}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {targetClass?.classname || targetClass?.name || ann.classId || 'Toàn trường'}
                    </span>
                  </div>

                  {/* Actions: Pin button, Edit, Delete */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleTogglePin(ann.id, isPinned)}
                      title={isPinned ? 'Bỏ ghim thông báo' : 'Ghim lên đầu'}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        isPinned
                          ? 'bg-red-100 hover:bg-red-200 text-red-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      <span>{isPinned ? 'Bỏ ghim' : 'Ghim'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(ann)}
                      title="Chỉnh sửa thông báo"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(ann.id, ann.title)}
                      title="Xóa thông báo"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Announcement Title & Content */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {/* Footer info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {new Date(ann.createdAt).toLocaleDateString('vi-VN')} {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {ann.viewCount !== undefined && (
                      <span className="flex items-center">
                        <Eye className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {ann.viewCount} lượt xem
                      </span>
                    )}
                  </div>
                  <span>
                    Người tạo: <strong>{ann.authorName || 'GVCN'}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal CRUD Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                <span>{editingItem ? 'Chỉnh Sửa Thông Báo' : 'Tạo Thông Báo Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Select Class */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Lớp học nhận thông báo
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.classname || c.name} (Năm học: {c.schoolYear})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target (parent / student / all) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Đối tượng tiếp nhận (target)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTarget('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      target === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả (All)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget('parent')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      target === 'parent'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Phụ huynh (Parent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      target === 'student'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Học sinh (Student)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tiêu đề thông báo
                </label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề rõ ràng, súc tích..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nội dung chi tiết
                </label>
                <textarea
                  rows={5}
                  placeholder="Nhập nội dung thông báo gửi tới học sinh và phụ huynh..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Pin checkbox */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Pin className="h-3.5 w-3.5 text-red-500" />
                    <span>Ghim thông báo lên đầu trang (Pinned)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Thông báo ghim sẽ luôn được ưu tiên hiển thị đầu tiên tại ứng dụng của PH/HS
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <span>{isSubmitting ? 'Đang lưu...' : editingItem ? 'Lưu Thay Đổi' : 'Đăng Thông Báo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
