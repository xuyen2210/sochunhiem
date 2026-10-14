import React, { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  FileCheck,
  FileSpreadsheet,
  BookOpen,
  ClipboardList,
  FolderOpen,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Document, ClassInfo } from '../../core/types';
import {
  getAccessToken,
  googleSignIn,
  listDriveFiles,
  DriveFileItem,
} from '../../services/googleWorkspace';

interface AdminDocumentsProps {
  documents: Document[];
  classes: ClassInfo[];
  currentClassId: string;
  onAddDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateDocument: (id: string, patch: Partial<Document>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const AdminDocuments: React.FC<AdminDocumentsProps> = ({
  documents,
  classes,
  currentClassId,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [classId, setClassId] = useState(currentClassId || 'cls-12a1');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'rules' | 'plans' | 'forms' | 'curriculum' | 'schedule' | 'exam' | 'other' | string>('rules');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Drive File Picker State
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  const handleOpenDrivePicker = async () => {
    setIsDrivePickerOpen(true);
    setIsLoadingDrive(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (!res) {
          setIsDrivePickerOpen(false);
          setIsLoadingDrive(false);
          return;
        }
      }
      const data = await listDriveFiles({ pageSize: 30 });
      setDriveFiles(data.files);
    } catch (err: any) {
      console.error('Error fetching drive files for picker:', err);
      showToast(err.message || 'Không thể kết nối Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleSelectDriveFile = (file: DriveFileItem) => {
    setTitle(file.name);
    setUrl(file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`);
    if (file.mimeType.includes('spreadsheet')) {
      setCategory('forms');
    } else if (file.mimeType.includes('document')) {
      setCategory('curriculum');
    } else {
      setCategory('plans');
    }
    setIsDrivePickerOpen(false);
    showToast(`Đã chọn tệp "${file.name}" từ Google Drive`);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setClassId(selectedClassId === 'all' ? (classes[0]?.id || 'cls-12a1') : selectedClassId);
    setTitle('');
    setUrl('');
    setCategory('rules');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Document) => {
    setEditingItem(doc);
    setClassId(doc.classId || classes[0]?.id || 'cls-12a1');
    setTitle(doc.title);
    setUrl(doc.url || doc.fileUrl || '');
    setCategory(doc.category || 'rules');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await onUpdateDocument(editingItem.id, {
          classId,
          title: title.trim(),
          url: url.trim(),
          fileUrl: url.trim(),
          category,
        });
        showToast('Đã cập nhật tài liệu thành công!');
      } else {
        await onAddDocument({
          classId,
          title: title.trim(),
          url: url.trim(),
          fileUrl: url.trim(),
          category,
          fileSize: '1.5 MB (Tệp đính kèm)',
          uploadedBy: 'Thầy Nguyễn Văn Xuyên',
        });
        showToast('Đã thêm tài liệu mới thành công!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save document', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${titleStr}"?`)) {
      await onDeleteDocument(id);
      showToast('Đã xóa tài liệu thành công!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    const matchClass = selectedClassId === 'all' || doc.classId === selectedClassId;
    const matchCategory =
      selectedCategory === 'all' ||
      doc.category === selectedCategory ||
      (selectedCategory === 'rules' && doc.category === 'rule') ||
      (selectedCategory === 'plans' && doc.category === 'schedule') ||
      (selectedCategory === 'forms' && doc.category === 'other');
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q || doc.title.toLowerCase().includes(q) || (doc.url && doc.url.toLowerCase().includes(q));
    return matchClass && matchCategory && matchSearch;
  });

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
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Quản Lý Kho Tài Liệu, Kế Hoạch & Biểu Mẫu</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module CRUD Documents: Quản lý nội quy lớp, kế hoạch giảng dạy, đề cương ôn tập, biểu mẫu hành chính
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Tải Lên / Thêm Tài Liệu Mới</span>
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

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span className="font-semibold">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="rules">Nội quy & Quy chế</option>
              <option value="plans">Kế hoạch & Lịch thi</option>
              <option value="forms">Biểu mẫu & Đơn từ</option>
              <option value="curriculum">Đề cương & Bài tập</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên tài liệu hoặc liên kết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Chưa có tài liệu nào trong thư mục</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nhấn nút Thêm tài liệu mới để đưa các tệp nội quy, kế hoạch, biểu mẫu lên hệ thống.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Thêm tài liệu ngay
            </button>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const catInfo = getCategoryDetails(doc.category);
            const CatIcon = catInfo.icon;
            const targetClass = classes.find((c) => c.id === doc.classId);
            const downloadUrl = doc.url || doc.fileUrl || '#';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${catInfo.color}`}
                    >
                      <CatIcon className="h-3 w-3 mr-1" />
                      <span>{catInfo.label}</span>
                    </span>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {targetClass?.classname || targetClass?.name || doc.classId}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {doc.title}
                  </h3>

                  <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                      {new Date(doc.createdAt || doc.uploadedAt || new Date()).toLocaleDateString('vi-VN')}
                    </span>
                    {doc.uploadedBy && <span>Người đăng: {doc.uploadedBy}</span>}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 truncate font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    URL: {doc.url || doc.fileUrl}
                  </div>
                </div>

                {/* Card Actions: Edit, Delete, View/Download */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(doc)}
                      title="Chỉnh sửa tài liệu"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      title="Xóa tài liệu"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem / Tải liên kết</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal CRUD Document */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>{editingItem ? 'Chỉnh Sửa Tài Liệu' : 'Thêm Tài Liệu Mới'}</span>
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
                  Áp dụng cho lớp học
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.classname || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Danh mục tài liệu (category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="rules">Nội quy & Quy định lớp học</option>
                  <option value="plans">Kế hoạch & Thời khóa biểu</option>
                  <option value="forms">Biểu mẫu hành chính & Đơn từ</option>
                  <option value="curriculum">Đề cương & Tài liệu học tập</option>
                  <option value="other">Tài liệu khác</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tiêu đề tài liệu
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nội quy lớp học & tiêu chí thi đua năm 2026-2027"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Đường dẫn tệp / Liên kết tải xuống (url)
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenDrivePicker}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                    <span>Chọn từ Google Drive</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="https://... hoặc liên kết Google Drive, PDF"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  {isSubmitting ? 'Đang lưu...' : editingItem ? 'Lưu Thay Đổi' : 'Tạo Tài Liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHỌN TỆP TỪ GOOGLE DRIVE */}
      {isDrivePickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Chọn Tệp từ Google Drive của bạn
                </h3>
              </div>
              <button
                onClick={() => setIsDrivePickerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingDrive ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Đang kết nối Google Drive và đọc danh sách tệp...
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không tìm thấy tệp nào trong Google Drive của bạn.
                </div>
              ) : (
                driveFiles.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelectDriveFile(f)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {f.mimeType} {f.size ? `• ${(parseInt(f.size) / 1024).toFixed(0)} KB` : ''}
                      </p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0">
                      Chọn tệp này
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right shrink-0">
              <button
                onClick={() => setIsDrivePickerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
