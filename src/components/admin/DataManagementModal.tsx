import React, { useState, useRef } from 'react';
import {
  Trash2,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  UserPlus,
  Sparkles,
  Layers,
  Check,
  School,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ClassInfo, Student } from '../../core/types';
import {
  ParsedStudentRow,
  downloadStudentTemplate,
  parseStudentExcelFile,
} from '../../utils/excelStudentHelper';
import {
  getAccessToken,
  googleSignIn,
  listDriveFiles,
  getSpreadsheetValues,
  getGoogleSpreadsheet,
  DriveFileItem,
} from '../../services/googleWorkspace';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  students: Student[];
  currentClassId: string;
  onClearMockData: (customClass: Partial<ClassInfo>) => Promise<void>;
  onRestoreMockData: () => Promise<void>;
  onImportStudents: (
    students: (Omit<Student, 'id'> & {
      parentName?: string;
      parentPhone?: string;
      parentRelationship?: string;
    })[]
  ) => Promise<void>;
  onCreateStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  currentClassId,
  onClearMockData,
  onRestoreMockData,
  onImportStudents,
  onCreateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'clear' | 'import'>('clear');
  const [importMethod, setImportMethod] = useState<'excel' | 'paste' | 'sheets' | 'manual'>('excel');

  // Clear tab state
  const [isClearing, setIsClearing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form custom class for real school
  const currentClass = classes.find((c) => c.id === currentClassId) || classes[0];
  const [realClassName, setRealClassName] = useState(currentClass?.classname || currentClass?.name || 'Lớp 12A1');
  const [realGrade, setRealGrade] = useState(currentClass?.grade || 'Khối 12');
  const [realSchoolYear, setRealSchoolYear] = useState(currentClass?.schoolYear || '2026 - 2027');
  const [realTeacherName, setRealTeacherName] = useState(
    currentClass?.homeroomTeacher || currentClass?.homeroomTeacherName || 'Thầy Nguyễn Văn Xuyên'
  );
  const [realSchoolName, setRealSchoolName] = useState('Trung tâm GDNN - GDTX Thị xã Long Mỹ, Tỉnh Hậu Giang');
  const [realRoom, setRealRoom] = useState(currentClass?.room || 'Phòng học 12A1');
  const [realTeacherPhone, setRealTeacherPhone] = useState(currentClass?.teacherPhone || '0918 345 678');
  const [realTeacherEmail, setRealTeacherEmail] = useState(
    currentClass?.teacherEmail || 'xuyennv.gdtxlongmy@haugiang.edu.vn'
  );

  // Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);

  // Paste text state
  const [pastedText, setPastedText] = useState('');
  const [parsedPastedStudents, setParsedPastedStudents] = useState<
    Array<{
      fullname: string;
      dob: string;
      gender: 'male' | 'female';
      phone?: string;
      address?: string;
      parentName?: string;
      parentPhone?: string;
    }>
  >([]);

  // Google Sheets import state
  const [googleDriveFiles, setGoogleDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheetUrl, setSelectedSheetUrl] = useState('');
  const [sheetPreviewRows, setSheetPreviewRows] = useState<(string | number | boolean)[][]>([]);

  // Manual single student state
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualDob, setManualDob] = useState('2009-01-01');
  const [manualGender, setManualGender] = useState<'male' | 'female'>('male');
  const [manualAddress, setManualAddress] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualParentName, setManualParentName] = useState('');
  const [manualParentPhone, setManualParentPhone] = useState('');

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // --- 1. Clear Mock Data Action ---
  const handleExecuteClear = async () => {
    if (
      !window.confirm(
        'Xác nhận: Xóa sạch dữ liệu mẫu (các học sinh thử nghiệm, điểm danh, nề nếp) và thiết lập lớp học thực tế?'
      )
    ) {
      return;
    }
    setIsClearing(true);
    try {
      await onClearMockData({
        classname: realClassName.trim() || 'Lớp 12A1',
        name: realClassName.trim() || 'Lớp 12A1',
        grade: realGrade,
        schoolYear: realSchoolYear,
        homeroomTeacher: realTeacherName.trim(),
        homeroomTeacherName: realTeacherName.trim(),
        note: realSchoolName.trim(),
        room: realRoom.trim(),
        teacherPhone: realTeacherPhone.trim(),
        teacherEmail: realTeacherEmail.trim(),
      });
      showToast('Đã xóa dữ liệu mẫu thành công! Hãy chuyển sang bước Nhập dữ liệu thực tế.');
      setActiveTab('import');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa dữ liệu mẫu', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // --- 2. Restore Mock Data Action ---
  const handleExecuteRestore = async () => {
    if (!window.confirm('Khôi phục lại dữ liệu mẫu ban đầu của Hệ thống?')) return;
    setIsRestoring(true);
    try {
      await onRestoreMockData();
      showToast('Đã khôi phục dữ liệu mẫu ban đầu!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi khôi phục dữ liệu', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // --- 3. Handle Excel Upload & Parse ---
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setIsParsingExcel(true);
    setExcelError(null);
    try {
      const activeClass = classes.find((c) => c.id === currentClassId) || classes[0];
      const parsedRes = await parseStudentExcelFile(file, classes, activeClass?.id || 'cls-12a1');
      setParsedRows(parsedRes.rows);
      if (parsedRes.rows.length === 0) {
        setExcelError('Không tìm thấy dòng học sinh hợp lệ nào trong file Excel.');
      }
    } catch (err: any) {
      setExcelError(err.message || 'Lỗi khi đọc file Excel');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleSaveExcelStudents = async () => {
    const valid = parsedRows.filter((r) => r.isValid);
    if (valid.length === 0) {
      showToast('Không có học sinh hợp lệ để lưu.', 'error');
      return;
    }
    setIsSubmittingImport(true);
    try {
      const activeClass = classes.find((c) => c.id === currentClassId) || classes[0];
      const newItems = valid.map((r) => ({
        classId: activeClass?.id || 'cls-12a1',
        studentCode: r.studentCode || `HS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fullname: r.fullname,
        fullName: r.fullname,
        dob: r.dob,
        gender: r.gender,
        address: r.address || 'Hậu Giang',
        phone: r.phone || '',
        status: r.status || 'active',
        academicRank: r.academicRank,
        conduct: r.conduct,
        notes: r.notes,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        parentRelationship: r.parentRelationship || 'Bố/Mẹ',
      }));

      await onImportStudents(newItems as any);
      showToast(`Đã nhập thành công ${newItems.length} học sinh thực tế vào lớp!`);
      setExcelFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi nhập danh sách', 'error');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // --- 4. Parse Pasted Text ---
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    const lines = pastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    const result: Array<{
      fullname: string;
      dob: string;
      gender: 'male' | 'female';
      phone?: string;
      address?: string;
      parentName?: string;
      parentPhone?: string;
    }> = [];

    lines.forEach((line) => {
      // Clean leading number e.g. "1. ", "01/ ", "1\t"
      const cleaned = line.replace(/^\d+[\.\-\)\s\t]+/, '').trim();
      if (!cleaned) return;

      // Check if line contains separators like '-' or ';' or tab
      const parts = cleaned.split(/[\-\;\t|]/).map((p) => p.trim());
      const fullname = parts[0] || '';
      if (!fullname) return;

      let dob = '2009-01-01';
      let gender: 'male' | 'female' = 'male';
      let phone = '';
      let address = 'Hậu Giang';
      let parentName = '';
      let parentPhone = '';

      parts.slice(1).forEach((part) => {
        const lower = part.toLowerCase();
        // check date
        const dateMatch = part.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
        if (dateMatch) {
          const d = dateMatch[1].padStart(2, '0');
          const m = dateMatch[2].padStart(2, '0');
          const y = dateMatch[3];
          dob = `${y}-${m}-${d}`;
        } else if (lower === 'nữ' || lower === 'nu' || lower === 'female' || lower === 'f') {
          gender = 'female';
        } else if (lower === 'nam' || lower === 'male' || lower === 'm') {
          gender = 'male';
        } else if (/^0\d{8,10}$/.test(part.replace(/\s+/g, ''))) {
          if (!phone) phone = part.replace(/\s+/g, '');
          else parentPhone = part.replace(/\s+/g, '');
        } else if (part.length > 5) {
          address = part;
        }
      });

      result.push({
        fullname,
        dob,
        gender,
        phone,
        address,
        parentName,
        parentPhone,
      });
    });

    setParsedPastedStudents(result);
  };

  const handleSavePastedStudents = async () => {
    if (parsedPastedStudents.length === 0) return;
    setIsSubmittingImport(true);
    try {
      const activeClass = classes.find((c) => c.id === currentClassId) || classes[0];
      const newItems = parsedPastedStudents.map((s, idx) => ({
        classId: activeClass?.id || 'cls-12a1',
        studentCode: `HS${String(idx + 1).padStart(3, '0')}`,
        fullname: s.fullname,
        fullName: s.fullname,
        dob: s.dob,
        gender: s.gender,
        address: s.address || 'Hậu Giang',
        phone: s.phone,
        status: 'active' as const,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentRelationship: 'Bố/Mẹ',
      }));

      await onImportStudents(newItems as any);
      showToast(`Đã nhập thành công ${newItems.length} học sinh thực tế!`);
      setPastedText('');
      setParsedPastedStudents([]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi nhập danh sách', 'error');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // --- 5. Google Sheets Inspect & Import ---
  const handleLoadGoogleDriveSheets = async () => {
    setIsLoadingSheets(true);
    try {
      let token = getAccessToken();
      if (!token) {
        await googleSignIn();
        token = getAccessToken();
      }
      if (!token) {
        showToast('Chưa kết nối tài khoản Google. Vui lòng đăng nhập Google!', 'error');
        return;
      }
      const res = await listDriveFiles({
        mimeTypeFilter: 'sheets',
        pageSize: 15,
      });
      setGoogleDriveFiles(res.files || []);
      if (!res.files || res.files.length === 0) {
        showToast('Không tìm thấy file Google Sheets nào trong Google Drive của bạn.');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi truy cập Google Drive', 'error');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleInspectGoogleSheet = async (sheetIdOrUrl: string) => {
    let cleanId = sheetIdOrUrl.trim();
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) cleanId = match[1];

    if (!cleanId) {
      showToast('Vui lòng nhập liên kết hoặc chọn file Google Sheet hợp lệ', 'error');
      return;
    }

    setIsLoadingSheets(true);
    try {
      const meta = await getGoogleSpreadsheet(cleanId);
      const firstTab = meta.sheets?.[0]?.properties?.title || 'Sheet1';
      const rows = await getSpreadsheetValues(cleanId, `${firstTab}!A1:Z60`);
      setSheetPreviewRows(rows);
      showToast(`Đã đọc ${rows.length} dòng từ Google Sheet "${meta.properties.title}"`);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đọc file Google Sheet', 'error');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSaveGoogleSheetStudents = async () => {
    if (!sheetPreviewRows || sheetPreviewRows.length < 2) {
      showToast('Bảng tính không có đủ dòng dữ liệu học sinh', 'error');
      return;
    }
    setIsSubmittingImport(true);
    try {
      const activeClass = classes.find((c) => c.id === currentClassId) || classes[0];
      const dataRows = sheetPreviewRows.slice(1);
      const newItems: any[] = [];

      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0) return;
        // Check column layout: STT (0), Code (1), Name (2), Dob (3), Gender (4), Address (5), Parent (6), ParentPhone (7)
        const col1 = String(row[1] || '').trim();
        const col2 = String(row[2] || '').trim();
        const col0 = String(row[0] || '').trim();

        // determine which column is name
        let fullname = col2 || col1 || col0;
        let studentCode = col1 && col2 ? col1 : `HS${String(idx + 1).padStart(3, '0')}`;
        if (!fullname || fullname.toLowerCase().includes('họ và tên') || fullname.toLowerCase().includes('stt')) {
          return;
        }

        const dob = String(row[3] || '2009-01-01').trim();
        const gender = String(row[4] || '').toLowerCase().includes('nữ') ? 'female' : 'male';
        const address = String(row[5] || 'Long Mỹ, Hậu Giang').trim();
        const parentName = row[6] ? String(row[6]).trim() : undefined;
        const parentPhone = row[7] ? String(row[7]).trim() : undefined;

        newItems.push({
          classId: activeClass?.id || 'cls-12a1',
          studentCode,
          fullname,
          fullName: fullname,
          dob,
          gender,
          address,
          status: 'active',
          parentName,
          parentPhone,
          parentRelationship: 'Bố/Mẹ',
        });
      });

      if (newItems.length === 0) {
        showToast('Không tìm thấy học sinh hợp lệ để lưu', 'error');
        return;
      }

      await onImportStudents(newItems as any);
      showToast(`Đã nạp thành công ${newItems.length} học sinh từ Google Sheet!`);
      setSheetPreviewRows([]);
      setSelectedSheetUrl('');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi nhập dữ liệu', 'error');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // --- 6. Manual Single Student ---
  const handleSaveManualStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      showToast('Vui lòng nhập Họ và tên học sinh', 'error');
      return;
    }
    setIsSubmittingImport(true);
    try {
      const activeClass = classes.find((c) => c.id === currentClassId) || classes[0];
      await onCreateStudent({
        classId: activeClass?.id || 'cls-12a1',
        studentCode: manualCode.trim() || `HS${String(students.length + 1).padStart(3, '0')}`,
        fullname: manualName.trim(),
        fullName: manualName.trim(),
        dob: manualDob,
        gender: manualGender,
        address: manualAddress.trim() || 'Thị xã Long Mỹ, Hậu Giang',
        phone: manualPhone.trim(),
        status: 'active',
        academicRank: 'Khá',
        conduct: 'Tốt',
      });

      showToast(`Đã thêm học sinh "${manualName.trim()}" thành công!`);
      setManualName('');
      setManualCode('');
      setManualPhone('');
      setManualAddress('');
      setManualParentName('');
      setManualParentPhone('');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi thêm học sinh', 'error');
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const isMockDataPresent = students.some(
    (s) =>
      s.fullname === 'Trần Minh Quân' ||
      s.fullname === 'Nguyễn Thị Mai Anh' ||
      s.fullname === 'Lê Hoàng Nam'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Database className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Quản Lý Dữ Liệu: Xóa Mẫu & Nhập Dữ Liệu Thực</h2>
              <p className="text-xs text-blue-100">
                Khởi tạo dữ liệu thực tế cho GVCN Thầy Nguyễn Văn Xuyên • Trung tâm GDNN - GDTX Long Mỹ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center space-x-2 shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Status Indicator */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Trạng thái hiện tại:</span>
            {isMockDataPresent ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                Đang có {students.length} học sinh mẫu (Dữ liệu thử nghiệm)
              </span>
            ) : students.length === 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                Dữ liệu sạch (0 học sinh) - Sẵn sàng nạp danh sách thực
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <School className="h-3 w-3 mr-1 text-blue-600" />
                Lớp thực tế ({students.length} học sinh)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('clear')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'clear'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Xóa Dữ Liệu Mẫu
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'import'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Nhập Dữ Liệu Thực
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: XÓA DỮ LIỆU MẪU */}
          {activeTab === 'clear' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Alert box */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-950">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>Xóa sạch dữ liệu thử nghiệm để bắt đầu năm học mới</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-xs">
                  Khi thực hiện xóa, hệ thống sẽ dọn dẹp các học sinh mẫu (Trần Minh Quân, Mai Anh, Hoàng Nam...),
                  các bản ghi điểm danh mẫu, nề nếp thi đua, thông báo và bài tập mẫu. Bạn sẽ nhận được một hệ thống sạch
                  hoàn toàn để nhập danh sách học sinh thực tế của lớp mình.
                </p>
              </div>

              {/* Class setup parameters */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <School className="h-4 w-4 text-blue-600" />
                  <span>Thiết lập thông tin Lớp học thực tế của Thầy / Cô</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tên lớp học (*)</label>
                    <input
                      type="text"
                      value={realClassName}
                      onChange={(e) => setRealClassName(e.target.value)}
                      placeholder="Ví dụ: Lớp 12A1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Khối lớp</label>
                    <input
                      type="text"
                      value={realGrade}
                      onChange={(e) => setRealGrade(e.target.value)}
                      placeholder="Khối 12"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Năm học</label>
                    <input
                      type="text"
                      value={realSchoolYear}
                      onChange={(e) => setRealSchoolYear(e.target.value)}
                      placeholder="2026 - 2027"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Giáo viên chủ nhiệm (*)</label>
                    <input
                      type="text"
                      value={realTeacherName}
                      onChange={(e) => setRealTeacherName(e.target.value)}
                      placeholder="Thầy Nguyễn Văn Xuyên"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Trường / Trung tâm</label>
                    <input
                      type="text"
                      value={realSchoolName}
                      onChange={(e) => setRealSchoolName(e.target.value)}
                      placeholder="Trung tâm GDNN - GDTX Thị xã Long Mỹ, Tỉnh Hậu Giang"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Số điện thoại GV</label>
                    <input
                      type="text"
                      value={realTeacherPhone}
                      onChange={(e) => setRealTeacherPhone(e.target.value)}
                      placeholder="0918 345 678"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email giáo viên</label>
                    <input
                      type="email"
                      value={realTeacherEmail}
                      onChange={(e) => setRealTeacherEmail(e.target.value)}
                      placeholder="xuyennv.gdtxlongmy@haugiang.edu.vn"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Phòng học</label>
                    <input
                      type="text"
                      value={realRoom}
                      onChange={(e) => setRealRoom(e.target.value)}
                      placeholder="Phòng học 12A1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring || isClearing}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>Khôi phục dữ liệu mẫu ban đầu</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('import')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Bỏ qua, đến trang Nhập thực
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteClear}
                    disabled={isClearing || isRestoring}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isClearing ? 'Đang xóa...' : 'Xác nhận: Xóa sạch mẫu & Bắt đầu lớp thực tế'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHẬP DỮ LIỆU THỰC */}
          {activeTab === 'import' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Method Selector Tabs */}
              <div className="flex flex-wrap border-b border-slate-200 pb-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setImportMethod('excel')}
                  className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
                    importMethod === 'excel'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Cách 1: Nhập từ File Excel (.xlsx / .csv)</span>
                </button>

                <button
                  onClick={() => setImportMethod('paste')}
                  className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
                    importMethod === 'paste'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Cách 2: Dán danh sách chữ (Copy từ Word/Zalo)</span>
                </button>

                <button
                  onClick={() => setImportMethod('sheets')}
                  className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
                    importMethod === 'sheets'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Cách 3: Từ Google Sheets / Google Drive</span>
                </button>

                <button
                  onClick={() => setImportMethod('manual')}
                  className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
                    importMethod === 'manual'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Cách 4: Thêm từng học sinh thủ công</span>
                </button>
              </div>

              {/* METHOD 1: EXCEL */}
              {importMethod === 'excel' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                        <span>Mẫu danh sách học sinh chuẩn Excel</span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Tải file mẫu Excel chuẩn tiếng Việt có đầy đủ các cột: Mã HS, Họ và tên, Ngày sinh, Giới tính, Địa chỉ, SĐT Phụ huynh.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadStudentTemplate(classes)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      <span>Tải file mẫu (.xlsx)</span>
                    </button>
                  </div>

                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelFileChange}
                      className="hidden"
                    />
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {excelFile ? excelFile.name : 'Nhấp hoặc Kéo thả file Excel học sinh thực tế vào đây'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Hỗ trợ định dạng file Microsoft Excel (.xlsx, .xls) hoặc file văn bản CSV
                      </p>
                    </div>
                    {isParsingExcel && (
                      <p className="text-xs text-blue-600 font-semibold animate-pulse">Đang phân tích file Excel...</p>
                    )}
                  </div>

                  {excelError && (
                    <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{excelError}</span>
                    </div>
                  )}

                  {/* Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          Đã đọc {parsedRows.length} học sinh ({parsedRows.filter((r) => r.isValid).length} hợp lệ)
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveExcelStudents}
                          disabled={isSubmittingImport}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>{isSubmittingImport ? 'Đang lưu...' : 'Nạp toàn bộ vào danh sách lớp'}</span>
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold">
                            <tr>
                              <th className="p-2 border-b">STT</th>
                              <th className="p-2 border-b">Họ và tên</th>
                              <th className="p-2 border-b">Ngày sinh</th>
                              <th className="p-2 border-b">Giới tính</th>
                              <th className="p-2 border-b">Địa chỉ</th>
                              <th className="p-2 border-b">Phụ huynh & SĐT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedRows.map((r, i) => (
                              <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                                <td className="p-2 font-mono">{i + 1}</td>
                                <td className="p-2 font-semibold text-slate-800">{r.fullname}</td>
                                <td className="p-2 text-slate-600">{r.dobDisplay || r.dob}</td>
                                <td className="p-2">{r.gender === 'female' ? 'Nữ' : 'Nam'}</td>
                                <td className="p-2 text-slate-600 truncate max-w-[150px]">{r.address}</td>
                                <td className="p-2 text-slate-600">
                                  {r.parentName || r.parentPhone ? `${r.parentName || ''} (${r.parentPhone || ''})` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: PASTE TEXT */}
              {importMethod === 'paste' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <p className="font-bold flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span>Nhập siêu nhanh bằng cách dán danh sách họ tên từ Word hoặc Zalo</span>
                    </p>
                    <p className="text-blue-800 text-[11px]">
                      Mỗi dòng là một học sinh. Hệ thống tự động tách Họ tên, Giới tính, Ngày sinh, Số điện thoại.
                      Ví dụ: <code className="bg-white px-1.5 py-0.5 rounded border">1. Nguyễn Văn An - 15/05/2009 - Nam - 0918123456</code>
                      hoặc chỉ cần danh sách tên: <code className="bg-white px-1.5 py-0.5 rounded border">Trần Văn Bình</code>
                    </p>
                  </div>

                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`1. Trần Minh Quân - 15/03/2009 - Nam - TX Long Mỹ\n2. Nguyễn Thị Mai Anh - 22/08/2009 - Nữ - Xã Long Trị\n3. Lê Hoàng Nam - 10/01/2009 - Nam - Phụ huynh: 0978778899`}
                    className="w-full p-3 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Phân tích danh sách chữ
                    </button>

                    {parsedPastedStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSavePastedStudents}
                        disabled={isSubmittingImport}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                      >
                        <Check className="h-4 w-4" />
                        <span>Nạp {parsedPastedStudents.length} học sinh vào lớp</span>
                      </button>
                    )}
                  </div>

                  {parsedPastedStudents.length > 0 && (
                    <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0">
                          <tr>
                            <th className="p-2 border-b">STT</th>
                            <th className="p-2 border-b">Họ và tên</th>
                            <th className="p-2 border-b">Ngày sinh</th>
                            <th className="p-2 border-b">Giới tính</th>
                            <th className="p-2 border-b">SĐT / Phụ huynh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedPastedStudents.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono">{idx + 1}</td>
                              <td className="p-2 font-semibold text-slate-800">{s.fullname}</td>
                              <td className="p-2">{s.dob}</td>
                              <td className="p-2">{s.gender === 'female' ? 'Nữ' : 'Nam'}</td>
                              <td className="p-2 text-slate-600">{s.phone || s.parentPhone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 3: GOOGLE SHEETS */}
              {importMethod === 'sheets' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-2">
                    <p className="font-bold flex items-center space-x-1.5">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      <span>Nạp danh sách học sinh trực tiếp từ Google Sheets trên Google Drive</span>
                    </p>
                    <p className="text-indigo-800 text-[11px]">
                      Hệ thống kết nối trực tiếp với tài khoản Google Drive & Sheets của bạn để lấy dữ liệu học sinh thật.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={selectedSheetUrl}
                      onChange={(e) => setSelectedSheetUrl(e.target.value)}
                      placeholder="Dán link hoặc ID Google Sheet chứa danh sách học sinh..."
                      className="flex-1 min-w-[280px] px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleInspectGoogleSheet(selectedSheetUrl)}
                      disabled={isLoadingSheets || !selectedSheetUrl.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isLoadingSheets ? 'Đang đọc...' : 'Đọc bảng tính'}
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadGoogleDriveSheets}
                      disabled={isLoadingSheets}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Xem các file trên Drive
                    </button>
                  </div>

                  {googleDriveFiles.length > 0 && (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-xs">
                      <p className="font-bold text-slate-700">Chọn file từ Google Drive của bạn:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {googleDriveFiles.map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => {
                              setSelectedSheetUrl(file.id);
                              handleInspectGoogleSheet(file.id);
                            }}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 text-left transition-colors flex items-center space-x-2"
                          >
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sheetPreviewRows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          Đã đọc {sheetPreviewRows.length - 1} dòng dữ liệu học sinh
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveGoogleSheetStudents}
                          disabled={isSubmittingImport}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                        >
                          <Check className="h-4 w-4" />
                          <span>Lưu vào danh sách học sinh thực</span>
                        </button>
                      </div>

                      <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 sticky top-0">
                            <tr>
                              {sheetPreviewRows[0]?.slice(0, 6).map((h, i) => (
                                <th key={i} className="p-2 border-b font-semibold">
                                  {String(h)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sheetPreviewRows.slice(1, 15).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                {row.slice(0, 6).map((col, cIdx) => (
                                  <td key={cIdx} className="p-2">
                                    {String(col)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 4: MANUAL SINGLE STUDENT */}
              {importMethod === 'manual' && (
                <form onSubmit={handleSaveManualStudent} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Mã học sinh</label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="VD: HS-001 (để trống sẽ tự sinh)"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1">Họ và tên (*)</label>
                      <input
                        type="text"
                        required
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="VD: Nguyễn Văn An"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={manualDob}
                        onChange={(e) => setManualDob(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Giới tính</label>
                      <select
                        value={manualGender}
                        onChange={(e) => setManualGender(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Số điện thoại HS</label>
                      <input
                        type="text"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        placeholder="0918..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 font-semibold mb-1">Địa chỉ thường trú</label>
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="Khu vực 2, Phường Thuận An, TX Long Mỹ, Hậu Giang"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingImport}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{isSubmittingImport ? 'Đang lưu...' : 'Thêm học sinh này'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">
            Học sinh hiện có trong lớp: <strong className="text-slate-800">{students.length}</strong> em
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
