import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  X,
  User,
  GraduationCap,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  FileText,
  RefreshCw,
  Check,
  Briefcase,
} from 'lucide-react';
import { ClassInfo, Parent, Student } from '../../core/types';
import {
  ParsedParentRow,
  ParentParseResult,
  downloadParentTemplate,
  parseParentsExcelFile,
  exportParentsToExcel,
} from '../../utils/excelParentHelper';

interface AdminParentsProps {
  parents: Parent[];
  students: Student[];
  classes: ClassInfo[];
  onCreateParent: (parent: Omit<Parent, 'id'>) => Promise<void>;
  onImportParents?: (parents: Omit<Parent, 'id'>[]) => Promise<void>;
  onUpdateParent: (id: string, data: Partial<Parent>) => Promise<void>;
  onDeleteParent: (id: string) => Promise<void>;
}

export const AdminParents: React.FC<AdminParentsProps> = ({
  parents,
  students,
  classes,
  onCreateParent,
  onImportParents,
  onUpdateParent,
  onDeleteParent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelation, setFilterRelation] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // Form fields matching exact spec: { id, fullname, phone, email, relationship, studentId }
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [studentId, setStudentId] = useState(students[0]?.id || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Excel Import Modal State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParentParseResult | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [editableRows, setEditableRows] = useState<ParsedParentRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [filterPreviewTab, setFilterPreviewTab] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreateModal = () => {
    setEditingParent(null);
    setFullname('');
    setPhone('');
    setEmail('');
    setRelationship('Bố');
    setStudentId(students[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Parent) => {
    setEditingParent(p);
    setFullname(p.fullname || p.fullName || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setRelationship((p.relationship as any) || 'Bố');
    setStudentId(p.studentId || students[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !phone.trim() || !studentId) return;

    setIsSubmitting(true);
    try {
      const selectedStudent = students.find((s) => s.id === studentId);
      const studentName = selectedStudent?.fullname || selectedStudent?.fullName || 'Học sinh';

      const parentPayload = {
        fullname: fullname.trim(),
        fullName: fullname.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship,
        studentId,
        studentName,
      };

      if (editingParent) {
        await onUpdateParent(editingParent.id, parentPayload);
        setFeedbackMsg(`Cập nhật thông tin phụ huynh "${fullname}" thành công!`);
      } else {
        await onCreateParent({
          ...parentPayload,
          avatar:
            relationship === 'Mẹ'
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        });
        setFeedbackMsg(`Thêm mới phụ huynh "${fullname}" thành công!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Đã có lỗi xảy ra khi lưu phụ huynh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xác nhận xóa phụ huynh "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await onDeleteParent(id);
      setFeedbackMsg(`Đã xóa phụ huynh "${name}" thành công!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Excel Import Handlers ---
  const openImportModal = () => {
    setParseResult(null);
    setFileBuffer(null);
    setSelectedFileName('');
    setActiveSheet('');
    setEditableRows([]);
    setSelectedIndices(new Set());
    setFilterPreviewTab('all');
    setIsImportModalOpen(true);
  };

  const handleFileChosen = (file: File) => {
    if (!file) return;
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel');

    if (!isExcel) {
      alert('Vui lòng chọn file định dạng Excel (.xlsx hoặc .xls)');
      return;
    }

    setSelectedFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        setFileBuffer(buffer);
        const result = parseParentsExcelFile(buffer, students, classes);
        setParseResult(result);
        setActiveSheet(result.activeSheet);
        setEditableRows(result.rows);

        // Pre-select all valid rows
        const validSet = new Set<number>();
        result.rows.forEach((r, idx) => {
          if (r.isValid) validSet.add(idx);
        });
        setSelectedIndices(validSet);
      } catch (err: any) {
        console.error(err);
        alert('Lỗi đọc file Excel: ' + (err.message || 'Không thể xử lý file.'));
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      alert('Không thể đọc file đã chọn.');
      setIsParsing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
  };

  const handleSheetChange = (newSheet: string) => {
    if (!fileBuffer) return;
    setActiveSheet(newSheet);
    setIsParsing(true);
    try {
      const result = parseParentsExcelFile(fileBuffer, students, classes, newSheet);
      setParseResult(result);
      setEditableRows(result.rows);
      const validSet = new Set<number>();
      result.rows.forEach((r, idx) => {
        if (r.isValid) validSet.add(idx);
      });
      setSelectedIndices(validSet);
    } catch (err: any) {
      alert('Lỗi chuyển sheet: ' + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Allow inline editing of matched student in preview table
  const handleUpdateRowStudent = (rowIdx: number, newStudentId: string) => {
    const updated = [...editableRows];
    const row = { ...updated[rowIdx] };
    const st = students.find((s) => s.id === newStudentId);

    if (st) {
      const cls = classes.find((c) => c.id === st.classId);
      row.matchedStudentId = st.id;
      row.matchedStudentName = st.fullname || st.fullName || '';
      row.matchedStudentCode = st.studentCode || '';
      row.matchedStudentClassName = cls?.classname || cls?.name || '';
      // Recalculate errors
      const errs: string[] = [];
      if (!row.fullname) errs.push('Thiếu họ và tên phụ huynh');
      if (!row.phone) errs.push('Thiếu số điện thoại liên hệ');
      else if (row.phone.length < 8 || row.phone.length > 13) errs.push('Số điện thoại không đúng định dạng');
      row.errors = errs;
      row.isValid = errs.length === 0;
    } else {
      row.matchedStudentId = '';
      row.matchedStudentName = '';
      row.matchedStudentCode = '';
      row.matchedStudentClassName = '';
      row.errors = ['Chưa chọn học sinh liên kết'];
      row.isValid = false;
    }

    updated[rowIdx] = row;
    setEditableRows(updated);

    // Auto select if now valid
    if (row.isValid) {
      setSelectedIndices((prev) => new Set(prev).add(rowIdx));
    }
  };

  const toggleSelectRow = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === displayedRows.length) {
      setSelectedIndices(new Set());
    } else {
      const allDisplayed = new Set(displayedRows.map((r) => editableRows.indexOf(r)));
      setSelectedIndices(allDisplayed);
    }
  };

  // Filter preview rows
  const displayedRows = editableRows.filter((r) => {
    if (filterPreviewTab === 'valid') return r.isValid;
    if (filterPreviewTab === 'invalid') return !r.isValid;
    return true;
  });

  const validCount = editableRows.filter((r) => r.isValid).length;
  const invalidCount = editableRows.length - validCount;

  // Confirm import
  const handleConfirmImport = async () => {
    const selectedRows = Array.from(selectedIndices)
      .map((idx) => editableRows[idx])
      .filter((r) => r && r.isValid && r.fullname && r.phone && r.matchedStudentId);

    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một dòng phụ huynh hợp lệ để nhập vào hệ thống.');
      return;
    }

    setIsImporting(true);
    try {
      const parentsToCreate: Omit<Parent, 'id'>[] = selectedRows.map((row) => ({
        fullname: row.fullname,
        fullName: row.fullname,
        phone: row.phone,
        email: row.email,
        relationship: row.relationship,
        studentId: row.matchedStudentId,
        studentName: row.matchedStudentName,
        job: row.job,
        avatar:
          row.relationship === 'Mẹ'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      }));

      if (onImportParents) {
        await onImportParents(parentsToCreate);
      } else {
        // Fallback sequentially
        for (const p of parentsToCreate) {
          await onCreateParent(p);
        }
      }

      setFeedbackMsg(`Đã nhập thành công ${selectedRows.length} phụ huynh vào hệ thống và liên kết với học sinh!`);
      setIsImportModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi nhập phụ huynh: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsImporting(false);
    }
  };

  const filteredParents = parents.filter((p) => {
    const matchesRelation = filterRelation === 'all' || p.relationship === filterRelation;
    const nameMatch = (p.fullname || p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (p.phone || '').includes(searchTerm);
    const emailMatch = (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRelation && (nameMatch || phoneMatch || emailMatch);
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <span>Quản Lý Phụ Huynh (Parents CRUD)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ thông tin liên lạc của cha mẹ / người giám hộ học sinh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download template */}
          <button
            onClick={() => downloadParentTemplate(students, classes)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            title="Tải file mẫu Excel chuẩn"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Tải Mẫu Excel</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportParentsToExcel(parents, students, classes)}
            disabled={parents.length === 0}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            title="Xuất toàn bộ danh sách phụ huynh ra file Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Bulk Import from Excel */}
          <button
            onClick={openImportModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Upload className="h-4 w-4" />
            <span>Nhập File Excel (.xlsx)</span>
          </button>

          {/* Manual Add */}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Phụ Huynh Mới</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên phụ huynh, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Mối quan hệ:
          </span>
          <select
            value={filterRelation}
            onChange={(e) => setFilterRelation(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả mối quan hệ</option>
            <option value="Bố">Bố</option>
            <option value="Mẹ">Mẹ</option>
            <option value="Người giám hộ">Người giám hộ</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Họ Và Tên Phụ Huynh</th>
                <th className="py-3.5 px-4">Quan Hệ</th>
                <th className="py-3.5 px-4">Học Sinh Liên Kết</th>
                <th className="py-3.5 px-4">Số Điện Thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy phụ huynh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => {
                  const student = students.find((s) => s.id === parent.studentId);
                  const parentName = parent.fullname || parent.fullName || 'Phụ huynh';
                  const studentName = student ? (student.fullname || student.fullName) : (parent.studentName || 'Chưa gắn');
                  const studentCode = student?.studentCode;

                  return (
                    <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={parent.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                            alt={parentName}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{parentName}</p>
                            <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                              {parent.job && (
                                <>
                                  <Briefcase className="h-2.5 w-2.5" />
                                  <span>{parent.job}</span>
                                </>
                              )}
                              {!parent.job && <span>Gia đình</span>}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Relationship */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          parent.relationship === 'Bố'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : parent.relationship === 'Mẹ'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {parent.relationship}
                        </span>
                      </td>

                      {/* Associated Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">
                              {studentName}
                            </span>
                            {studentCode && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {studentCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <a
                          href={`tel:${parent.phone}`}
                          className="flex items-center text-blue-600 font-semibold hover:underline"
                        >
                          <Phone className="h-3 w-3 mr-1 text-slate-400" />
                          <span>{parent.phone}</span>
                        </a>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {parent.email ? (
                          <a
                            href={`mailto:${parent.email}`}
                            className="flex items-center text-slate-700 hover:text-blue-600"
                          >
                            <Mail className="h-3 w-3 mr-1 text-slate-400" />
                            <span className="truncate max-w-[180px]">{parent.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa có email</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(parent)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Sửa thông tin phụ huynh"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(parent.id, parentName)}
                            disabled={deletingId === parent.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa phụ huynh"
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

      {/* ========================================================================= */}
      {/* MODAL: IMPORT PHỤ HUYNH BẰNG FILE EXCEL (.XLSX)                          */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Nhập Phụ Huynh Hàng Loạt Bằng File Excel (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tải lên danh sách bảng tính Excel, hệ thống sẽ tự động ghép nối với hồ sơ học sinh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 py-4 space-y-5">
              {/* If no file uploaded yet */}
              {!parseResult ? (
                <div className="space-y-4">
                  {/* Download template banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-blue-900">
                          Chưa có file mẫu Excel chuẩn?
                        </p>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          Tải về bảng mẫu có sẵn cấu trúc cột (Họ tên, SĐT, Quan hệ, Mã HS hoặc Tên con, Email, Nghề nghiệp) cùng dữ liệu mẫu.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadParentTemplate(students, classes)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center space-x-1.5 shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Tải Mẫu (.xlsx)</span>
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                        : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChosen(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                      <Upload className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Kéo & thả file Excel (.xlsx, .xls) vào đây
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hoặc click để chọn file từ máy tính của bạn
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-3 text-[11px] text-slate-400">
                      <span>• Hỗ trợ .xlsx, .xls</span>
                      <span>• Tự động khớp theo Mã HS hoặc Tên con</span>
                      <span>• Kiểm tra lỗi số điện thoại</span>
                    </div>
                  </div>

                  {isParsing && (
                    <div className="flex items-center justify-center space-x-2 py-4 text-emerald-600 text-xs font-bold">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang phân tích bảng tính Excel...</span>
                    </div>
                  )}
                </div>
              ) : (
                /* File has been parsed -> Show Preview & Config */
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                            {selectedFileName}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 font-semibold text-slate-700">
                            {editableRows.length} dòng
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="text-emerald-600 font-semibold">
                            ✓ {validCount} hợp lệ
                          </span>
                          {invalidCount > 0 && (
                            <span className="text-amber-600 font-semibold">
                              ⚠ {invalidCount} cần chỉnh sửa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Sheet selector */}
                      {parseResult.sheetNames.length > 1 && (
                        <div className="flex items-center space-x-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Sheet:</span>
                          <select
                            value={activeSheet}
                            onChange={(e) => handleSheetChange(e.target.value)}
                            className="text-xs rounded-lg border border-slate-200 py-1 px-2 bg-white"
                          >
                            {parseResult.sheetNames.map((sn) => (
                              <option key={sn} value={sn}>
                                {sn}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setParseResult(null);
                          setFileBuffer(null);
                          setSelectedFileName('');
                          setEditableRows([]);
                        }}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Đổi file</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setFilterPreviewTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          filterPreviewTab === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả ({editableRows.length})
                      </button>
                      <button
                        onClick={() => setFilterPreviewTab('valid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          filterPreviewTab === 'valid'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Hợp lệ ({validCount})
                      </button>
                      <button
                        onClick={() => setFilterPreviewTab('invalid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          filterPreviewTab === 'invalid'
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Cần xem lại ({invalidCount})
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={toggleSelectAll}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {selectedIndices.size === displayedRows.length
                          ? 'Bỏ chọn tất cả'
                          : 'Chọn tất cả dòng này'}
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase z-10">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">
                            <input
                              type="checkbox"
                              checked={
                                displayedRows.length > 0 &&
                                displayedRows.every((r) =>
                                  selectedIndices.has(editableRows.indexOf(r))
                                )
                              }
                              onChange={toggleSelectAll}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                          </th>
                          <th className="py-2.5 px-3">Họ Tên Phụ Huynh</th>
                          <th className="py-2.5 px-3">SĐT</th>
                          <th className="py-2.5 px-3">Quan Hệ</th>
                          <th className="py-2.5 px-3">Học Sinh Liên Kết (Khớp tự động)</th>
                          <th className="py-2.5 px-3">Email / Nghề nghiệp</th>
                          <th className="py-2.5 px-3 text-right">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">
                              Không có dòng nào trong bộ lọc này.
                            </td>
                          </tr>
                        ) : (
                          displayedRows.map((row) => {
                            const realIdx = editableRows.indexOf(row);
                            const isSelected = selectedIndices.has(realIdx);

                            return (
                              <tr
                                key={realIdx}
                                className={`hover:bg-slate-50/70 transition-colors ${
                                  !row.isValid ? 'bg-amber-50/30' : isSelected ? 'bg-emerald-50/20' : ''
                                }`}
                              >
                                {/* Checkbox */}
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectRow(realIdx)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500"
                                  />
                                </td>

                                {/* Fullname */}
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-slate-900 block">
                                    {row.fullname || <span className="text-red-500 italic">Thiếu họ tên</span>}
                                  </span>
                                  {row.notes && (
                                    <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                                      {row.notes}
                                    </span>
                                  )}
                                </td>

                                {/* Phone */}
                                <td className="py-2.5 px-3">
                                  <span className={`font-mono ${row.phone ? 'text-slate-800' : 'text-red-500 italic'}`}>
                                    {row.phone || 'Thiếu SĐT'}
                                  </span>
                                </td>

                                {/* Relationship */}
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      row.relationship === 'Bố'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : row.relationship === 'Mẹ'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                  >
                                    {row.relationship}
                                  </span>
                                </td>

                                {/* Matched Student with selection override */}
                                <td className="py-2.5 px-3">
                                  <div className="space-y-1">
                                    {row.matchedStudentId ? (
                                      <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
                                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                        <span>
                                          {row.matchedStudentName}
                                        </span>
                                        {row.matchedStudentClassName && (
                                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                            {row.matchedStudentClassName}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1 text-amber-600 text-[11px]">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        <span>Chưa khớp HS: "{row.studentIdentifier || 'Trống'}"</span>
                                      </div>
                                    )}

                                    {/* Select override dropdown */}
                                    <select
                                      value={row.matchedStudentId}
                                      onChange={(e) => handleUpdateRowStudent(realIdx, e.target.value)}
                                      className="w-full text-[11px] rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                      <option value="">-- Chọn hoặc đổi học sinh --</option>
                                      {students.map((st) => {
                                        const c = classes.find((cl) => cl.id === st.classId);
                                        return (
                                          <option key={st.id} value={st.id}>
                                            {st.studentCode ? `[${st.studentCode}] ` : ''}
                                            {st.fullname || st.fullName} ({c?.classname || c?.name || 'Lớp'})
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </td>

                                {/* Email / Job */}
                                <td className="py-2.5 px-3 text-slate-600">
                                  <span className="block truncate max-w-[140px]">
                                    {row.email || '—'}
                                  </span>
                                  {row.job && (
                                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                      {row.job}
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 text-right">
                                  {row.isValid ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                      <span>Hợp lệ</span>
                                    </span>
                                  ) : (
                                    <div className="inline-flex flex-col items-end">
                                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                                        <AlertCircle className="h-3 w-3 text-red-600" />
                                        <span>Lỗi dữ liệu</span>
                                      </span>
                                      <span className="text-[9px] text-red-600 mt-0.5 text-right max-w-[130px] truncate" title={row.errors.join(', ')}>
                                        {row.errors[0]}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>

              {parseResult && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Đã chọn {selectedIndices.size} phụ huynh
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isImporting || selectedIndices.size === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang nhập dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Nhập {selectedIndices.size} Phụ Huynh Đã Chọn</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT PARENT (Single manual entry)                        */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingParent ? 'Cập Nhật Thông Tin Phụ Huynh' : 'Thêm Phụ Huynh Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Họ và tên phụ huynh (fullname) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bác Trần Văn Hùng"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số điện thoại (phone) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0913 888 777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mối quan hệ (relationship) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email liên hệ (email)
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Học sinh liên kết (studentId) <span className="text-red-500">*</span>
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.studentCode ? `[${st.studentCode}] ` : ''}{st.fullname || st.fullName}
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
                  {isSubmitting ? 'Đang lưu...' : editingParent ? 'Lưu Thay Đổi' : 'Thêm Phụ Huynh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
