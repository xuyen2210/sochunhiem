import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileSpreadsheet,
  FileText,
  File,
  Upload,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Plus,
  Layers,
  ArrowRight,
  Database,
  Table,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import {
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser,
  initAuth,
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  deleteDriveFile,
  DriveFileItem,
  createGoogleSpreadsheet,
  getGoogleSpreadsheet,
  getSpreadsheetValues,
  exportEmulationToGoogleSheet,
  exportAttendanceToGoogleSheet,
  exportStudentsToGoogleSheet,
  GoogleSpreadsheet,
} from '../../services/googleWorkspace';
import { Attendance, ClassInfo, Document, Parent, Student } from '../../core/types';
import { computeEmulationRankings, DEFAULT_SCALE_CONFIG } from '../../utils/emulationHelper';

interface AdminGoogleWorkspaceProps {
  classes: ClassInfo[];
  currentClassId: string;
  students: Student[];
  parents: Parent[];
  attendance: Attendance[];
  behaviors: any[];
  onAddDocument?: (doc: Omit<Document, 'id' | 'createdAt'>) => Promise<void>;
  onImportStudents?: (newStudents: any[]) => Promise<void>;
}

export const AdminGoogleWorkspace: React.FC<AdminGoogleWorkspaceProps> = ({
  classes,
  currentClassId,
  students,
  parents,
  attendance,
  behaviors,
  onAddDocument,
  onImportStudents,
}) => {
  // Auth state
  const [user, setUser] = useState<any>(getCurrentUser());
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'sync'>('drive');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState<'all' | 'sheets' | 'docs' | 'folders' | 'pdf'>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isNewFolderLoading, setIsNewFolderLoading] = useState(false);

  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isNewSheetLoading, setIsNewSheetLoading] = useState(false);

  // Destructive Delete Confirmation Modal (MANDATORY per workspace integration rules)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Export State
  const [exportType, setExportType] = useState<'emulation' | 'attendance' | 'students'>('emulation');
  const [selectedClassId, setSelectedClassId] = useState(currentClassId || classes[0]?.id || 'cls-12a1');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);

  // Import from Sheets state
  const [importSpreadsheetId, setImportSpreadsheetId] = useState('');
  const [importRange, setImportRange] = useState('Sheet1!A1:Z50');
  const [isInspectingSheet, setIsInspectingSheet] = useState(false);
  const [inspectedSheet, setInspectedSheet] = useState<GoogleSpreadsheet | null>(null);
  const [previewRows, setPreviewRows] = useState<(string | number | boolean)[][]>([]);
  const [isImportingStudents, setIsImportingStudents] = useState(false);

  // General Toast / Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Init Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
        setAuthChecked(true);
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthChecked(true);
      }
    );

    // Initial check
    getAccessToken().then((tok) => {
      setToken(tok);
      setUser(getCurrentUser());
      setAuthChecked(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch Drive Files when token or filter changes
  const loadFiles = async () => {
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      const result = await listDriveFiles({
        query: searchQuery,
        mimeTypeFilter: mimeFilter,
        folderId: currentFolderId,
      });
      setDriveFiles(result.files);
    } catch (err: any) {
      console.error('Load files error:', err);
      showToast(err.message || 'Lỗi khi tải tệp từ Google Drive', 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadFiles();
    }
  }, [token, mimeFilter, currentFolderId]);

  // Sign In Handler
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast('Kết nối Google Drive & Sheets thành công!');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      showToast(err.message || 'Không thể đăng nhập Google', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    showToast('Đã đăng xuất tài khoản Google');
  };

  // Search Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles();
  };

  // Create Folder Handler
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsNewFolderLoading(true);
    try {
      await createDriveFolder(newFolderName.trim(), currentFolderId);
      showToast(`Đã tạo thư mục "${newFolderName.trim()}" trên Google Drive`);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      loadFiles();
    } catch (err: any) {
      showToast(err.message || 'Lỗi tạo thư mục', 'error');
    } finally {
      setIsNewFolderLoading(false);
    }
  };

  // Upload Local File to Drive
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Đang tải tệp "${file.name}" lên Google Drive...`);
    try {
      await uploadFileToDrive(file.name, file.type || 'application/octet-stream', file, currentFolderId);
      showToast(`Đã tải lên "${file.name}" thành công!`);
      loadFiles();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải tệp lên Google Drive', 'error');
    } finally {
      e.target.value = '';
    }
  };

  // Create Blank Google Sheet
  const handleCreateBlankSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;
    setIsNewSheetLoading(true);
    try {
      const sheet = await createGoogleSpreadsheet(newSheetTitle.trim(), [
        {
          title: 'Sheet1',
          rows: [['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Ghi Chú']],
        },
      ]);
      showToast(`Đã tạo Google Sheet "${newSheetTitle}" thành công!`);
      setNewSheetTitle('');
      setIsNewSheetOpen(false);
      loadFiles();
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tạo bảng tính', 'error');
    } finally {
      setIsNewSheetLoading(false);
    }
  };

  // Delete File (MANDATORY User Confirmation Dialog)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      showToast(`Đã xóa "${fileToDelete.name}" trên Google Drive.`);
      setFileToDelete(null);
      loadFiles();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa tệp', 'error');
    } finally {
      setIsDeletingFile(false);
    }
  };

  // Link Drive File to School Documents list
  const handleLinkToDocuments = async (file: DriveFileItem) => {
    if (!onAddDocument) return;
    try {
      await onAddDocument({
        classId: selectedClassId,
        title: file.name,
        url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        fileUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        category: file.mimeType.includes('spreadsheet') ? 'forms' : 'curriculum',
        fileSize: file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB (Google Drive)` : 'Google Drive',
        uploadedBy: user?.displayName || 'GVCN',
      });
      showToast(`Đã lưu "${file.name}" vào Kho Tài Liệu của trường!`);
    } catch (err: any) {
      showToast('Lỗi khi lưu tài liệu', 'error');
    }
  };

  // Export to Google Sheets
  const handleExportToGoogleSheets = async () => {
    setIsExporting(true);
    setExportSuccessUrl(null);
    const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const className = targetClass?.name || '12A1';

    try {
      if (exportType === 'emulation') {
        const classStudents = students.filter((s) => s.classId === selectedClassId);
        const classBehaviors = behaviors.filter((b) => !b.classId || b.classId === selectedClassId);
        const rankings = computeEmulationRankings(classStudents, classBehaviors, DEFAULT_SCALE_CONFIG, selectedClassId).list;

        const res = await exportEmulationToGoogleSheet(rankings, className, 'Tháng 10/2026');
        setExportSuccessUrl(res.spreadsheetUrl);
        showToast('Đã xuất Bảng Xếp Loại Thi Đua lên Google Sheets thành công!');
      } else if (exportType === 'attendance') {
        const classAttendance = attendance.filter((a) => !a.classId || a.classId === selectedClassId);
        const classStudents = students.filter((s) => s.classId === selectedClassId);

        const res = await exportAttendanceToGoogleSheet(classAttendance, classStudents, className, 'Tháng 10/2026');
        setExportSuccessUrl(res.spreadsheetUrl);
        showToast('Đã xuất Sổ Điểm Danh lên Google Sheets thành công!');
      } else if (exportType === 'students') {
        const classStudents = students.filter((s) => s.classId === selectedClassId);
        const res = await exportStudentsToGoogleSheet(classStudents, parents, className);
        setExportSuccessUrl(res.spreadsheetUrl);
        showToast('Đã xuất Danh Sách Học Sinh lên Google Sheets thành công!');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err.message || 'Lỗi khi xuất lên Google Sheets', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Inspect Google Sheet for Import
  const handleInspectSheet = async (sheetId: string) => {
    let cleanId = sheetId.trim();
    // Extract ID if user pasted full URL
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) cleanId = match[1];

    if (!cleanId) {
      showToast('Vui lòng nhập ID hoặc đường dẫn Google Sheet hợp lệ', 'error');
      return;
    }

    setIsInspectingSheet(true);
    try {
      const meta = await getGoogleSpreadsheet(cleanId);
      setInspectedSheet(meta);
      setImportSpreadsheetId(cleanId);

      const firstTab = meta.sheets?.[0]?.properties?.title || 'Sheet1';
      const defaultRange = `${firstTab}!A1:Z50`;
      setImportRange(defaultRange);

      const rows = await getSpreadsheetValues(cleanId, defaultRange);
      setPreviewRows(rows);
      showToast(`Đã đọc ${rows.length} dòng từ Google Sheet "${meta.properties.title}"`);
    } catch (err: any) {
      console.error('Inspect error:', err);
      showToast(err.message || 'Không thể đọc Google Sheet. Kiểm tra quyền truy cập!', 'error');
    } finally {
      setIsInspectingSheet(false);
    }
  };

  // Execute Import Students from sheet
  const handleImportStudentsFromSheet = async () => {
    if (!previewRows || previewRows.length < 2) {
      showToast('Bảng tính không có đủ dữ liệu hàng để nhập', 'error');
      return;
    }

    setIsImportingStudents(true);
    try {
      // Row 0 is header. Rows 1.. are data
      const dataRows = previewRows.slice(1);
      const newStudentsList: any[] = [];

      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0 || !row[1] && !row[2]) return;
        // Parse columns based on typical export/import pattern:
        // STT (0), Mã HS (1), Họ tên (2), Ngày sinh (3), Giới tính (4), Địa chỉ (5), Tên PH (6), Quan hệ (7), ĐT PH (8)
        const studentCode = String(row[1] || `HS${String(idx + 1).padStart(3, '0')}`).trim();
        const fullname = String(row[2] || row[1] || `Học sinh ${idx + 1}`).trim();
        const dob = String(row[3] || '2008-01-01').trim();
        const gender = String(row[4] || '').toLowerCase().includes('nữ') ? 'female' : 'male';
        const address = String(row[5] || 'Long Mỹ, Hậu Giang').trim();
        const parentName = row[6] ? String(row[6]).trim() : undefined;
        const parentRelationship = row[7] ? String(row[7]).trim() : 'Bố';
        const parentPhone = row[8] ? String(row[8]).trim() : undefined;

        newStudentsList.push({
          classId: selectedClassId,
          studentCode,
          fullname,
          fullName: fullname,
          dob,
          gender,
          address,
          status: 'active',
          parentName,
          parentRelationship,
          parentPhone,
        });
      });

      if (newStudentsList.length === 0) {
        showToast('Không tìm thấy dữ liệu học sinh hợp lệ để nhập', 'error');
        return;
      }

      if (onImportStudents) {
        await onImportStudents(newStudentsList);
        showToast(`Đã nhập thành công ${newStudentsList.length} học sinh từ Google Sheet!`);
        setInspectedSheet(null);
        setPreviewRows([]);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      showToast(err.message || 'Lỗi khi nhập học sinh', 'error');
    } finally {
      setIsImportingStudents(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="h-5 w-5 text-amber-500" />;
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    if (mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-rose-600" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center space-x-2 text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner / Account Hub */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20 backdrop-blur-xs flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>Google Workspace 1P Integration</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/80 text-white">
                Drive + Sheets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trung Tâm Google Drive & Google Sheets
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
              Quản lý hồ sơ lớp học, tự động xuất bảng xếp loại thi đua, sổ điểm danh lên Google Sheets, và đồng bộ dữ liệu hai chiều với Google Drive.
            </p>
          </div>

          {/* Google Auth Status / Button */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[260px]">
            {user && token ? (
              <div className="w-full text-center space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-xs object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white text-blue-700 font-bold flex items-center justify-center shadow-xs">
                      {user.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold truncate max-w-[160px] text-white">
                      {user.displayName || 'Google Account'}
                    </p>
                    <p className="text-[10px] text-blue-200 truncate max-w-[160px]">
                      {user.email || 'Đã kết nối'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                  <span className="inline-flex items-center space-x-1 text-emerald-300 text-[11px] font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Đã cấp quyền</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center space-y-3">
                <p className="text-xs text-blue-100 font-medium">
                  Kết nối tài khoản Google để bắt đầu sử dụng Drive & Sheets
                </p>

                {/* Official Material Google Sign-In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center space-x-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Đang kết nối...' : 'Đăng nhập Google'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/20">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drive'
                ? 'bg-white text-blue-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Folder className="h-4 w-4" />
            <span>Google Drive Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sheets'
                ? 'bg-white text-emerald-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Xuất & Đồng Bộ Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sync'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Nhập Dữ Liệu từ Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!token ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Share2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-800">
              Yêu cầu kết nối tài khoản Google
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Để bảo mật dữ liệu học sinh và nhà trường, ứng dụng kết nối trực tiếp với tài khoản Google Drive và Google Sheets của bạn thông qua Firebase OAuth được phân quyền an toàn.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            <span>{isSigningIn ? 'Đang mở cửa sổ đăng nhập...' : 'Đăng nhập với Google để tiếp tục'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: GOOGLE DRIVE EXPLORER */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              {/* Actions & Filters Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search & Mime filter */}
                <div className="flex flex-1 items-center space-x-2">
                  <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm tệp trên Google Drive..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </form>

                  {/* Filter by type */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setMimeFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        mimeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setMimeFilter('sheets')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        mimeFilter === 'sheets' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google Sheets
                    </button>
                    <button
                      onClick={() => setMimeFilter('docs')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        mimeFilter === 'docs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google Docs
                    </button>
                    <button
                      onClick={() => setMimeFilter('folders')}
                      className={`px-2.5 py-1.5 rounded-lg transition-all ${
                        mimeFilter === 'folders' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Thư mục
                    </button>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsNewFolderOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <FolderPlus className="h-4 w-4 text-amber-600" />
                    <span>Thư mục mới</span>
                  </button>

                  <button
                    onClick={() => setIsNewSheetOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Tạo Sheet mới</span>
                  </button>

                  <label className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                    <Upload className="h-4 w-4" />
                    <span>Tải tệp lên Drive</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>

                  <button
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    title="Làm mới danh sách"
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Files Table / List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {currentFolderId ? 'Thư mục hiện tại' : 'Google Drive của tôi (Gốc)'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      ({driveFiles.length} tệp)
                    </span>
                  </div>

                  {currentFolderId && (
                    <button
                      onClick={() => setCurrentFolderId(undefined)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      ← Về thư mục gốc
                    </button>
                  )}
                </div>

                {isLoadingFiles ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-xs font-medium">Đang tải danh sách tệp từ Google Drive...</p>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <Folder className="h-10 w-10 mx-auto text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">Không tìm thấy tệp hoặc thư mục nào trên Google Drive</p>
                    <p className="text-[11px] text-slate-400">Bạn có thể tạo thư mục mới hoặc tải tệp lên bằng các nút bên trên.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {driveFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isSpreadsheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
                      const formattedDate = file.modifiedTime
                        ? new Date(file.modifiedTime).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      return (
                        <div
                          key={file.id}
                          className="px-5 py-3 hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-colors group"
                        >
                          <div
                            className="flex items-center space-x-3.5 min-w-0 flex-1 cursor-pointer"
                            onClick={() => {
                              if (isFolder) {
                                setCurrentFolderId(file.id);
                              } else if (file.webViewLink) {
                                window.open(file.webViewLink, '_blank');
                              }
                            }}
                          >
                            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-xs transition-all shrink-0">
                              {getFileIcon(file.mimeType)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                                {file.name}
                              </p>
                              <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                                <span>Cập nhật: {formattedDate}</span>
                                {file.size && <span>• {(parseInt(file.size) / (1024 * 1024)).toFixed(2)} MB</span>}
                                {isSpreadsheet && (
                                  <span className="px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    Sheet
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {isSpreadsheet && (
                              <button
                                onClick={() => {
                                  setActiveTab('sync');
                                  handleInspectSheet(file.id);
                                }}
                                title="Đọc dữ liệu bảng tính này"
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-emerald-200 transition-colors"
                              >
                                <Table className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Đọc Sheet</span>
                              </button>
                            )}

                            {onAddDocument && !isFolder && (
                              <button
                                onClick={() => handleLinkToDocuments(file)}
                                title="Lưu liên kết tệp này vào Kho Tài Liệu của trường"
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-blue-200 transition-colors"
                              >
                                <Share2 className="h-3.5 w-3.5 text-blue-600" />
                                <span className="hidden sm:inline">Lưu vào Kho Tài Liệu</span>
                              </button>
                            )}

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở trên Google Drive"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}

                            {/* Delete File Button (Opens Confirmation Modal) */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              title="Xóa tệp khỏi Google Drive"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT & SYNC TO GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Option 1: Emulation Rankings */}
                <div
                  onClick={() => setExportType('emulation')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                    exportType === 'emulation'
                      ? 'bg-gradient-to-br from-amber-50 to-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Bảng Xếp Loại Thi Đua Nề Nếp
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Xuất tự động bảng xếp loại học sinh theo thang điểm thi đua, cộng/trừ điểm, phân loại và nhận xét chi tiết lên Google Sheets.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                    <span>Định dạng chuẩn học đường</span>
                  </div>
                </div>

                {/* Option 2: Attendance Records */}
                <div
                  onClick={() => setExportType('attendance')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                    exportType === 'attendance'
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Sổ Điểm Danh Chuyên Cần
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Xuất toàn bộ lịch sử điểm danh của lớp, ngày vắng, lý do và số điện thoại liên lạc của phụ huynh.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-700 flex items-center space-x-1">
                    <span>Dữ liệu chuyên cần cập nhật</span>
                  </div>
                </div>

                {/* Option 3: Students & Parents */}
                <div
                  onClick={() => setExportType('students')}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                    exportType === 'students'
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50/40 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Database className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Danh Sách Học Sinh & Phụ Huynh
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Xuất hồ sơ sơ yếu lý lịch, mã số học sinh, thông tin bố mẹ và địa chỉ cư trú đầy đủ.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-700 flex items-center space-x-1">
                    <span>Hồ sơ liên lạc chủ nhiệm</span>
                  </div>
                </div>
              </div>

              {/* Export Execution Box */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">
                      Thiết lập xuất dữ liệu lên Google Sheets
                    </h3>
                    <p className="text-xs text-slate-500">
                      Google Sheet sẽ được tạo trực tiếp trong Google Drive cá nhân của bạn, sẵn sàng chia sẻ cho Ban Giám Hiệu hoặc Phụ huynh.
                    </p>
                  </div>

                  {/* Class selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-700">Chọn lớp:</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name || cls.classname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleExportToGoogleSheets}
                    disabled={isExporting}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{isExporting ? 'Đang tạo bảng tính trên Google Drive...' : 'Xuất Lên Google Sheets Ngay'}</span>
                  </button>

                  {exportSuccessUrl && (
                    <a
                      href={exportSuccessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all animate-bounce"
                    >
                      <ExternalLink className="h-4 w-4 text-emerald-600" />
                      <span>Mở Google Sheet vừa tạo trên trình duyệt</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT DATA FROM GOOGLE SHEETS */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">
                    Nhập dữ liệu học sinh từ Google Sheets vào Hệ Thống
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn tệp Google Sheet bất kỳ từ Google Drive hoặc dán đường dẫn để xem trước dữ liệu và nhập nhanh vào lớp.
                  </p>
                </div>

                {/* Form to inspect sheet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      ID hoặc Đường dẫn Google Sheet:
                    </label>
                    <input
                      type="text"
                      placeholder="Dán link Google Sheet hoặc ID (VD: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
                      value={importSpreadsheetId}
                      onChange={(e) => setImportSpreadsheetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Vùng dữ liệu (Sheet & Range):
                    </label>
                    <input
                      type="text"
                      placeholder="Sheet1!A1:Z50"
                      value={importRange}
                      onChange={(e) => setImportRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handleInspectSheet(importSpreadsheetId)}
                    disabled={isInspectingSheet || !importSpreadsheetId.trim()}
                    className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                    <span>{isInspectingSheet ? 'Đang đọc...' : 'Đọc và Xem trước Dữ liệu'}</span>
                  </button>

                  <span className="text-xs text-slate-400">
                    hoặc chọn nhanh từ danh sách tệp Google Sheets bên dưới
                  </span>
                </div>
              </div>

              {/* Data Preview Table */}
              {previewRows.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Bản xem trước dữ liệu: {inspectedSheet?.properties.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Đã tải {previewRows.length} dòng dữ liệu từ Google Sheets. Hàng 1 là tiêu đề cột.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            Nhập vào {cls.name || cls.classname}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleImportStudentsFromSheet}
                        disabled={isImportingStudents}
                        className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>{isImportingStudents ? 'Đang nhập...' : 'Xác nhận nhập học sinh'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                        <tr>
                          {previewRows[0]?.map((col, idx) => (
                            <th key={idx} className="px-3 py-2.5 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                              {String(col || `Cột ${idx + 1}`)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewRows.slice(1).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {previewRows[0]?.map((_, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 border-r border-slate-100 last:border-r-0 text-slate-700 whitespace-nowrap">
                                {String(row[cIdx] !== undefined ? row[cIdx] : '')}
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
        </>
      )}

      {/* MODAL: TẠO THƯ MỤC GOOGLE DRIVE */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900">
                <FolderPlus className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm">Tạo Thư Mục Mới trên Google Drive</h3>
              </div>
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tên thư mục:</label>
                <input
                  type="text"
                  placeholder="VD: Lớp 12A1 - Hồ sơ & Đề cương 2026-2027"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isNewFolderLoading || !newFolderName.trim()}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isNewFolderLoading ? 'Đang tạo...' : 'Tạo thư mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO SHEET MỚI */}
      {isNewSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">Tạo Bảng Tính Google Sheet Mới</h3>
              </div>
              <button
                onClick={() => setIsNewSheetOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlankSheet} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tên bảng tính:</label>
                <input
                  type="text"
                  placeholder="VD: Sổ Theo Dõi Thu Chi & Quỹ Lớp 12A1"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSheetOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isNewSheetLoading || !newSheetTitle.trim()}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isNewSheetLoading ? 'Đang tạo...' : 'Tạo và Mở Google Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS (DELETE FILE) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Xác nhận xóa tệp trên Google Drive?
                </h3>
                <p className="text-xs text-slate-500">
                  Hành động này sẽ xóa vĩnh viễn tệp trên Google Drive của bạn.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800 truncate">{fileToDelete.name}</p>
              <p className="text-[11px] text-slate-400">ID: {fileToDelete.id}</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeletingFile}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeletingFile}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingFile ? 'Đang xóa...' : 'Xác nhận Xóa Tệp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
