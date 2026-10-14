import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Camera,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  Filter,
  X,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  FileCheck2,
  Check,
  RefreshCw,
  HelpCircle,
  Phone,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ClassInfo, Parent, Student } from '../../core/types';
import {
  ParsedStudentRow,
  downloadStudentTemplate,
  exportStudentsToExcel,
  parseStudentExcelFile,
} from '../../utils/excelStudentHelper';
import {
  getAccessToken,
  googleSignIn,
  exportStudentsToGoogleSheet,
} from '../../services/googleWorkspace';

interface AdminStudentsProps {
  students: Student[];
  classes: ClassInfo[];
  parents: Parent[];
  currentClassId: string;
  onCreateStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  onUpdateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onNavigateToHeadshotWithPhoto?: (photoUrl: string, studentId: string) => void;
  onImportStudents?: (
    students: (Omit<Student, 'id'> & {
      parentName?: string;
      parentPhone?: string;
      parentRelationship?: string;
    })[]
  ) => Promise<void>;
  onOpenDataManagement?: () => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({
  students,
  classes,
  parents,
  currentClassId,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onNavigateToHeadshotWithPhoto,
  onImportStudents,
  onOpenDataManagement,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Single Student Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields matching exact spec: { id, classId, fullname, dob, gender, address, parentsId, status }
  const [formClassId, setFormClassId] = useState(currentClassId || classes[0]?.id || 'cls-12a1');
  const [formFullname, setFormFullname] = useState('');
  const [formDob, setFormDob] = useState('2009-01-01');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formAddress, setFormAddress] = useState('');
  const [formParentsId, setFormParentsId] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'transferred' | 'deferred'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Excel Import Modal State ---
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [overrideClassId, setOverrideClassId] = useState<string>('keep'); // 'keep' or a specific classId
  const [autoCreateParents, setAutoCreateParents] = useState<boolean>(true);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [filterPreviewTab, setFilterPreviewTab] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormClassId(selectedClassId === 'all' ? (classes[0]?.id || 'cls-12a1') : selectedClassId);
    setFormFullname('');
    setFormDob('2009-05-15');
    setFormGender('male');
    setFormAddress('TX Long Mỹ, Hậu Giang');
    setFormParentsId('');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormClassId(st.classId);
    setFormFullname(st.fullname || st.fullName || '');
    setFormDob(st.dob || '2009-01-01');
    setFormGender(st.gender || 'male');
    setFormAddress(st.address || '');
    setFormParentsId(st.parentsId || st.parentId || '');
    setFormStatus(st.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullname.trim() || !formClassId) return;

    setIsSubmitting(true);
    try {
      const studentPayload: Partial<Student> = {
        classId: formClassId,
        fullname: formFullname.trim(),
        fullName: formFullname.trim(),
        dob: formDob,
        gender: formGender,
        address: formAddress.trim(),
        parentsId: formParentsId || undefined,
        parentId: formParentsId || undefined,
        status: formStatus,
      };

      if (editingStudent) {
        await onUpdateStudent(editingStudent.id, studentPayload);
        setFeedbackMsg(`Cập nhật thông tin học sinh ${formFullname} thành công!`);
      } else {
        await onCreateStudent({
          ...(studentPayload as any),
          studentCode: `HS2026-${String(students.length + 1).padStart(3, '0')}`,
          avatar:
            formGender === 'male'
              ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
          academicRank: 'Khá',
          conduct: 'Tốt',
        });
        setFeedbackMsg(`Thêm mới học sinh ${formFullname} thành công!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Đã có lỗi xảy ra khi lưu thông tin học sinh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}" khỏi danh sách?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await onDeleteStudent(id);
      setFeedbackMsg(`Đã xóa học sinh "${name}" thành công!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Excel Import Handlers ---
  const openExcelModal = () => {
    setExcelFile(null);
    setParsedRows([]);
    setExcelError(null);
    setOverrideClassId(selectedClassId === 'all' ? (classes[0]?.id || 'cls-12a1') : selectedClassId);
    setSelectedRowIndices(new Set());
    setFilterPreviewTab('all');
    setIsExcelModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processExcelFile(file);
  };

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processExcelFile(file);
  };

  const processExcelFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setExcelError('Vui lòng chọn tệp bảng tính có đuôi mở rộng là .xlsx hoặc .xls.');
      return;
    }

    setExcelFile(file);
    setIsParsingExcel(true);
    setExcelError(null);

    try {
      const fallbackClass =
        overrideClassId !== 'keep'
          ? overrideClassId
          : selectedClassId === 'all'
          ? classes[0]?.id || 'cls-12a1'
          : selectedClassId;

      const result = await parseStudentExcelFile(file, classes, fallbackClass);
      setParsedRows(result.rows);

      // Select all valid rows by default
      const validIndices = new Set<number>();
      result.rows.forEach((row, idx) => {
        if (row.isValid) {
          validIndices.add(idx);
        }
      });
      setSelectedRowIndices(validIndices);

      if (result.rows.length === 0) {
        setExcelError('Không tìm thấy dữ liệu học sinh nào trong tệp Excel.');
      }
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setExcelError(err.message || 'Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleToggleSelectAll = () => {
    const validRowsList = parsedRows.map((r, i) => ({ r, i })).filter((x) => x.r.isValid);
    if (selectedRowIndices.size === validRowsList.length) {
      // Unselect all
      setSelectedRowIndices(new Set());
    } else {
      // Select all valid
      const newSet = new Set<number>();
      validRowsList.forEach((x) => newSet.add(x.i));
      setSelectedRowIndices(newSet);
    }
  };

  const handleToggleRow = (index: number) => {
    const next = new Set(selectedRowIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedRowIndices(next);
  };

  const handleConfirmImport = async () => {
    if (selectedRowIndices.size === 0) {
      alert('Vui lòng chọn ít nhất 1 học sinh hợp lệ để nhập vào hệ thống.');
      return;
    }

    setIsImporting(true);
    try {
      const rowsToImport = Array.from(selectedRowIndices)
        .map((idx) => parsedRows[idx])
        .filter(Boolean);

      const existingCount = students.length;

      const studentPayloads = rowsToImport.map((row, i) => {
        const assignedClassId =
          overrideClassId !== 'keep' ? overrideClassId : row.classId || classes[0]?.id || 'cls-12a1';

        const code =
          row.studentCode || `HS2026-${String(existingCount + i + 1).padStart(3, '0')}`;

        const avatar =
          row.gender === 'female'
            ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';

        return {
          classId: assignedClassId,
          fullname: row.fullname,
          fullName: row.fullname,
          name: row.fullname,
          dob: row.dob,
          gender: row.gender,
          address: row.address,
          status: row.status,
          studentCode: code,
          avatar,
          phone: row.phone,
          academicRank: row.academicRank || 'Khá',
          conduct: row.conduct || 'Tốt',
          notes: row.notes,
          parentName: autoCreateParents ? row.parentName : undefined,
          parentPhone: autoCreateParents ? row.parentPhone : undefined,
          parentRelationship: autoCreateParents ? row.parentRelationship : undefined,
        };
      });

      if (onImportStudents) {
        await onImportStudents(studentPayloads as any);
      } else {
        // Fallback: create one by one
        for (const st of studentPayloads) {
          await onCreateStudent(st as any);
        }
      }

      setFeedbackMsg(`Đã thêm thành công ${rowsToImport.length} học sinh từ file Excel!`);
      setIsExcelModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert('Đã xảy ra lỗi khi nhập danh sách học sinh: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsImporting(false);
    }
  };

  // Filter students by class and status
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const nameMatch = (s.fullname || s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = (s.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = (s.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesClass && matchesStatus && (nameMatch || codeMatch || addressMatch);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'transferred':
        return { label: 'Chuyển trường/lớp', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'deferred':
        return { label: 'Bảo lưu / Nghỉ', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Đang theo học', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const displayedPreviewRows = parsedRows.filter((r) => {
    if (filterPreviewTab === 'valid') return r.isValid;
    if (filterPreviewTab === 'invalid') return !r.isValid;
    return true;
  });

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const [isExportingSheets, setIsExportingSheets] = useState(false);

  const handleExportGoogleSheet = async () => {
    setIsExportingSheets(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        const signRes = await googleSignIn();
        if (!signRes) {
          setIsExportingSheets(false);
          return;
        }
      }
      const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];
      const res = await exportStudentsToGoogleSheet(
        filteredStudents,
        parents,
        targetClass?.name || '12A1'
      );
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      console.error('Lỗi xuất Google Sheets:', err);
      alert(err.message || 'Lỗi khi xuất danh sách học sinh lên Google Sheets');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Quản Lý Học Sinh (Danh Sách & Hồ Sơ Theo Lớp)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ học sinh, phân lớp, phụ huynh liên kết và nhập danh sách tự động bằng file Excel (.xlsx)
          </p>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Sample Template */}
          <button
            onClick={() => downloadStudentTemplate(classes)}
            title="Tải mẫu file Excel chuẩn (.xlsx) có sẵn cột dữ liệu và hướng dẫn"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Tải File Mẫu (.xlsx)</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() =>
              exportStudentsToExcel(
                filteredStudents,
                classes,
                parents,
                `Danh_Sach_Hoc_Sinh_${selectedClassId !== 'all' ? selectedClassId : 'TatCa'}.xlsx`
              )
            }
            title="Xuất danh sách học sinh hiện tại ra file Excel (.xlsx)"
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-emerald-200"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {/* Export to Google Sheets */}
          <button
            onClick={handleExportGoogleSheet}
            disabled={isExportingSheets}
            title="Xuất danh sách học sinh trực tiếp lên Google Sheets trên Google Drive"
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-teal-200 cursor-pointer disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4 text-teal-600" />
            <span>{isExportingSheets ? 'Đang tạo...' : 'Lưu Google Sheets'}</span>
          </button>

          {/* Clear Sample & Import Real Button */}
          {onOpenDataManagement && (
            <button
              onClick={onOpenDataManagement}
              title="Xóa dữ liệu mẫu để nhập dữ liệu học sinh thực tế"
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa Mẫu & Nhập Thực</span>
            </button>
          )}

          {/* Excel Import Button (Prominent Feature) */}
          <button
            onClick={openExcelModal}
            title="Thêm hàng loạt học sinh bằng file Excel dạng .xlsx"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Upload className="h-4 w-4" />
            <span>Nhập File Excel (.xlsx)</span>
            <span className="bg-emerald-800 text-[10px] text-emerald-100 px-1.5 py-0.2 rounded font-bold ml-0.5">
              Mới
            </span>
          </button>

          {/* Add Single Student */}
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Thủ Công</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã học sinh, địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter theo Lớp học (classId) */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Lọc theo lớp:
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 font-bold"
          >
            <option value="all">Tất cả các lớp ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.classname || cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter theo Trạng thái (status) */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Trạng thái:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang theo học</option>
            <option value="transferred">Chuyển trường/lớp</option>
            <option value="deferred">Bảo lưu/Nghỉ</option>
          </select>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Tổng số học sinh</p>
            <p className="text-base font-bold text-slate-900">{students.length} em</p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Đang theo học</p>
            <p className="text-base font-bold text-emerald-700">
              {students.filter((s) => s.status === 'active' || !s.status).length} em
            </p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Gắn phụ huynh</p>
            <p className="text-base font-bold text-indigo-700">
              {students.filter((s) => s.parentsId || s.parentId).length} em
            </p>
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Đang hiển thị</p>
            <p className="text-base font-bold text-slate-900">{filteredStudents.length} em</p>
          </div>
        </div>
      </div>

      {/* Students Data Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Học Sinh</th>
                <th className="py-3.5 px-4">Lớp Học</th>
                <th className="py-3.5 px-4">Ngày Sinh & Giới Tính</th>
                <th className="py-3.5 px-4">Địa Chỉ</th>
                <th className="py-3.5 px-4">Phụ Huynh Liên Kết</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p>Không tìm thấy học sinh nào phù hợp với bộ lọc.</p>
                      <button
                        onClick={openExcelModal}
                        className="text-blue-600 hover:text-blue-700 font-bold underline text-xs"
                      >
                        Bấm vào đây để nhập danh sách từ file Excel (.xlsx)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const studentClass = classes.find((c) => c.id === st.classId);
                  const studentParent = parents.find(
                    (p) => p.id === (st.parentsId || st.parentId) || p.studentId === st.id
                  );
                  const statusBadge = getStatusBadge(st.status);
                  const nameDisplay = st.fullname || st.fullName || 'Học sinh';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                st.avatar ||
                                (st.gender === 'female'
                                  ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
                                  : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80')
                              }
                              alt={nameDisplay}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                            />
                            {onNavigateToHeadshotWithPhoto && (
                              <button
                                onClick={() => onNavigateToHeadshotWithPhoto(st.avatar || '', st.id)}
                                title="Mở Studio chụp ảnh thẻ AI"
                                className="absolute -bottom-1 -right-1 p-0.5 bg-indigo-600 text-white rounded-full shadow-xs hover:scale-110 transition-transform"
                              >
                                <Camera className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{nameDisplay}</p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                                {st.studentCode || st.id}
                              </span>
                              {st.phone && (
                                <span className="text-[10px] text-slate-500 flex items-center">
                                  <Phone className="h-2.5 w-2.5 mr-0.5" />
                                  {st.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                          {studentClass?.classname || studentClass?.name || st.classId}
                        </span>
                      </td>

                      {/* DOB & Gender */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-medium">{new Date(st.dob).toLocaleDateString('vi-VN')}</p>
                        <span className="text-[10px] text-slate-400">
                          {st.gender === 'male' ? 'Nam' : 'Nữ'}
                        </span>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={st.address}>
                        {st.address}
                      </td>

                      {/* Parent info */}
                      <td className="py-3.5 px-4">
                        {studentParent ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {studentParent.fullname || studentParent.fullName}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {studentParent.relationship} • {studentParent.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa gắn phụ huynh</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(st)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(st.id, nameDisplay)}
                            disabled={deletingId === st.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* ======================================================== */}
      {/* MODAL: NHẬP NHIỀU HỌC SINH TỪ FILE EXCEL DẠNG .XLSX      */}
      {/* ======================================================== */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Thêm Nhiều Học Sinh Bằng File Excel (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ tệp bảng tính định dạng Microsoft Excel .xlsx và .xls, tự động đọc và đối soát cột dữ liệu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Step 1: Template and File Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left guidance card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-blue-800 font-bold text-xs">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                      <span>Hướng dẫn chuẩn bị file:</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
                      <li>
                        Cột bắt buộc: <strong>Họ và tên</strong> (Họ tên)
                      </li>
                      <li>
                        Cột tự nhận diện: <strong>Mã HS</strong>, <strong>Lớp</strong>,{' '}
                        <strong>Ngày sinh</strong> (dd/mm/yyyy), <strong>Giới tính</strong>,{' '}
                        <strong>Địa chỉ</strong>, <strong>SĐT</strong>
                      </li>
                      <li>
                        Hỗ trợ tạo kèm <strong>Phụ huynh</strong> & <strong>SĐT Phụ huynh</strong>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadStudentTemplate(classes)}
                    className="mt-3 w-full py-2 px-3 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-300 transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải File Excel Mẫu (.xlsx)</span>
                  </button>
                </div>

                {/* Right Upload Area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  className={`md:col-span-2 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    excelFile
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isParsingExcel ? (
                    <div className="flex flex-col items-center space-y-2 text-blue-600">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <p className="font-bold text-sm">Đang đọc và phân tích file Excel...</p>
                    </div>
                  ) : excelFile ? (
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                        <FileCheck2 className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-sm text-slate-900">{excelFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Kích thước: {(excelFile.size / 1024).toFixed(1)} KB • Bấm vào để chọn tệp khác
                      </p>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Đã đọc thành công {parsedRows.length} học sinh
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">
                          Kéo thả file Excel vào đây hoặc <span className="text-blue-600">chọn từ máy tính</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Định dạng chấp nhận: .xlsx hoặc .xls (Microsoft Excel)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {excelError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start space-x-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Lỗi đọc file Excel:</p>
                    <p className="text-[11px]">{excelError}</p>
                  </div>
                </div>
              )}

              {/* Step 2: Settings & Preview Table (When Rows Are Parsed) */}
              {parsedRows.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  {/* Settings toolbar */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Class override option */}
                      <div className="flex items-center space-x-2">
                        <label className="font-bold text-slate-700 whitespace-nowrap">
                          Phân lớp học sinh:
                        </label>
                        <select
                          value={overrideClassId}
                          onChange={(e) => setOverrideClassId(e.target.value)}
                          className="font-bold bg-white border border-slate-300 rounded-lg py-1.5 px-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="keep">Theo cột "Lớp" trong file Excel</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              Gán tất cả vào lớp: {c.classname || c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Parent auto-link checkbox */}
                      <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={autoCreateParents}
                          onChange={(e) => setAutoCreateParents(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Tự động tạo hồ sơ Phụ huynh nếu có Tên & SĐT trong Excel</span>
                      </label>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-slate-200 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => setFilterPreviewTab('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          filterPreviewTab === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả ({parsedRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterPreviewTab('valid')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          filterPreviewTab === 'valid'
                            ? 'bg-emerald-600 text-white'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        Hợp lệ ({validCount})
                      </button>
                      {invalidCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterPreviewTab('invalid')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            filterPreviewTab === 'invalid'
                              ? 'bg-rose-600 text-white'
                              : 'text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Lỗi ({invalidCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preview Table Header & Select All */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        {selectedRowIndices.size === validCount ? 'Bỏ chọn tất cả' : 'Chọn tất cả hợp lệ'}
                      </button>
                      <span>•</span>
                      <span>
                        Đã chọn <strong>{selectedRowIndices.size}</strong> / {validCount} học sinh hợp lệ
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Chỉ những dòng được tích chọn mới được nhập vào cơ sở dữ liệu
                    </span>
                  </div>

                  {/* Preview Data Grid */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 sticky top-0 z-10 text-[11px] font-bold text-slate-700">
                        <tr className="border-b border-slate-200">
                          <th className="py-2.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRowIndices.size === validCount && validCount > 0}
                              onChange={handleToggleSelectAll}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                          </th>
                          <th className="py-2.5 px-3 w-14">STT</th>
                          <th className="py-2.5 px-3">Mã HS</th>
                          <th className="py-2.5 px-3 font-bold">Họ Và Tên</th>
                          <th className="py-2.5 px-3">Lớp</th>
                          <th className="py-2.5 px-3">Ngày Sinh</th>
                          <th className="py-2.5 px-3">Giới Tính</th>
                          <th className="py-2.5 px-3">Địa Chỉ</th>
                          <th className="py-2.5 px-3">Phụ Huynh</th>
                          <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {displayedPreviewRows.map((row, idx) => {
                          const originalIdx = parsedRows.indexOf(row);
                          const isSelected = selectedRowIndices.has(originalIdx);

                          const targetClassName =
                            overrideClassId !== 'keep'
                              ? classes.find((c) => c.id === overrideClassId)?.classname ||
                                overrideClassId
                              : row.className;

                          return (
                            <tr
                              key={originalIdx}
                              className={`transition-colors ${
                                !row.isValid
                                  ? 'bg-rose-50/50 hover:bg-rose-50'
                                  : isSelected
                                  ? 'bg-blue-50/40 hover:bg-blue-50/70'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={!row.isValid}
                                  checked={isSelected}
                                  onChange={() => handleToggleRow(originalIdx)}
                                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 disabled:opacity-30"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">{row.rowNumber}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {row.studentCode || (
                                  <span className="text-slate-400 italic">Tự sinh</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {row.fullname || <span className="text-rose-500 italic">Trống</span>}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">
                                  {targetClassName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{row.dobDisplay}</td>
                              <td className="py-2.5 px-3 text-slate-600">{row.genderDisplay}</td>
                              <td
                                className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate"
                                title={row.address}
                              >
                                {row.address}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {row.parentName ? (
                                  <span>
                                    {row.parentName}
                                    {row.parentPhone ? ` (${row.parentPhone})` : ''}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {row.isValid ? (
                                  <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                    <Check className="h-3 w-3" />
                                    <span>Hợp lệ</span>
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center space-x-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold text-[10px]"
                                    title={row.errors.join(', ')}
                                  >
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Lỗi ({row.errors[0]})</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center space-x-2">
                {parsedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setExcelFile(null);
                      setParsedRows([]);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                  >
                    Chọn file khác
                  </button>
                )}

                <button
                  type="button"
                  disabled={isImporting || selectedRowIndices.size === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang nhập dữ liệu...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>
                        Xác Nhận Nhập {selectedRowIndices.size > 0 ? `(${selectedRowIndices.size} Học Sinh)` : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT SINGLE STUDENT                      */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Cập Nhật Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Lớp học (classId) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                    required
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.classname || cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trạng thái (status) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  >
                    <option value="active">Đang theo học (active)</option>
                    <option value="transferred">Chuyển lớp/trường (transferred)</option>
                    <option value="deferred">Bảo lưu / Nghỉ học (deferred)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Họ và tên (fullname) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formFullname}
                  onChange={(e) => setFormFullname(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ngày sinh (dob) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giới tính (gender)
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Địa chỉ thường trú (address) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khu vực 2, Phường Thuận An, Long Mỹ"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phụ huynh liên kết (parentsId)
                </label>
                <select
                  value={formParentsId}
                  onChange={(e) => setFormParentsId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                >
                  <option value="">-- Chưa gắn phụ huynh --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullname || p.fullName} ({p.relationship}) - SĐT: {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : editingStudent ? 'Lưu Thay Đổi' : 'Thêm Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
