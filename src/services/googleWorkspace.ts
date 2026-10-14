import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentEmulationItem } from '../utils/emulationHelper';
import { Attendance, Parent, Student } from '../core/types';

// Workspace Scopes configured via set_up_oauth
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// Initialize Firebase App & Auth
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are currently signing in
let isSigningIn = false;
// In-memory token cache (NEVER persisted to localStorage/sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

type AuthChangeListener = (user: User | null, token: string | null) => void;
const listeners = new Set<AuthChangeListener>();

export const onWorkspaceAuthChange = (listener: AuthChangeListener) => {
  listeners.add(listener);
  listener(cachedUser, cachedAccessToken);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(cachedUser, cachedAccessToken);
    } catch (e) {
      console.error('Error notifying auth listener:', e);
    }
  });
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User logged into Firebase session but needs popup for OAuth token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
    notifyListeners();
  });
};

// Google Sign-In with official popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được access token từ Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return cachedUser;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
  notifyListeners();
};

// --- Google Drive API Interfaces & Calls ---

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
}

export const listDriveFiles = async (params?: {
  query?: string;
  folderId?: string;
  mimeTypeFilter?: 'all' | 'sheets' | 'docs' | 'folders' | 'pdf';
  pageSize?: number;
  pageToken?: string;
}): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối tài khoản Google để truy cập Google Drive');

  const queryParts: string[] = ['trashed = false'];
  if (params?.folderId) {
    queryParts.push(`'${params.folderId}' in parents`);
  }
  if (params?.query && params.query.trim()) {
    const q = params.query.trim().replace(/'/g, "\\'");
    queryParts.push(`name contains '${q}'`);
  }
  if (params?.mimeTypeFilter === 'sheets') {
    queryParts.push(`mimeType = 'application/vnd.google-apps.spreadsheet'`);
  } else if (params?.mimeTypeFilter === 'docs') {
    queryParts.push(`mimeType = 'application/vnd.google-apps.document'`);
  } else if (params?.mimeTypeFilter === 'folders') {
    queryParts.push(`mimeType = 'application/vnd.google-apps.folder'`);
  } else if (params?.mimeTypeFilter === 'pdf') {
    queryParts.push(`mimeType = 'application/pdf'`);
  }

  const q = queryParts.join(' and ');
  const pageSize = params?.pageSize || 35;
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, parents, owners)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc');
  if (params?.pageToken) {
    url.searchParams.set('pageToken', params.pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tải danh sách tệp Google Drive (${res.status})`);
  }
  return await res.json();
};

export const createDriveFolder = async (
  folderName: string,
  parentId?: string
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google để tạo thư mục');

  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tạo thư mục Google Drive (${res.status})`);
  }
  return await res.json();
};

export const uploadFileToDrive = async (
  name: string,
  mimeType: string,
  content: Blob | string,
  parentFolderId?: string
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google');

  const metadata: any = {
    name,
    mimeType,
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = 'googledrive_' + Math.random().toString(36).substring(2);
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  let bodyContent: string | ArrayBuffer;
  if (typeof content === 'string') {
    bodyContent = content;
  } else {
    bodyContent = await content.arrayBuffer();
  }

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n`;

  const blobParts: (string | ArrayBuffer)[] = [metadataPart, bodyContent, closeDelimiter];
  const multipartBlob = new Blob(blobParts, { type: `multipart/related; boundary=${boundary}` });

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBlob,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tải tệp lên Google Drive (${res.status})`);
  }
  return await res.json();
};

export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi xóa tệp Google Drive (${res.status})`);
  }
};

// --- Google Sheets API Interfaces & Operations ---

export interface GoogleSheetProperties {
  sheetId: number;
  title: string;
  index: number;
  gridProperties?: {
    rowCount: number;
    columnCount: number;
  };
}

export interface GoogleSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
  };
  sheets?: {
    properties: GoogleSheetProperties;
  }[];
  spreadsheetUrl: string;
}

export const createGoogleSpreadsheet = async (
  title: string,
  initialSheets?: {
    title: string;
    rows?: (string | number)[][];
  }[]
): Promise<GoogleSpreadsheet> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google để tạo Google Sheet');

  const payload: any = {
    properties: {
      title,
    },
  };

  if (initialSheets && initialSheets.length > 0) {
    payload.sheets = initialSheets.map((s) => ({
      properties: { title: s.title },
    }));
  }

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tạo Google Sheet (${res.status})`);
  }

  const created: GoogleSpreadsheet = await res.json();

  // Populate data rows if provided
  if (initialSheets && initialSheets.length > 0) {
    for (const sheetData of initialSheets) {
      if (sheetData.rows && sheetData.rows.length > 0) {
        await updateSpreadsheetValues(created.spreadsheetId, `${sheetData.title}!A1`, sheetData.rows);
      }
    }
  }

  return created;
};

export const getGoogleSpreadsheet = async (spreadsheetId: string): Promise<GoogleSpreadsheet> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google để truy cập Google Sheet');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tải thông tin Google Sheet (${res.status})`);
  }
  return await res.json();
};

export const getSpreadsheetValues = async (
  spreadsheetId: string,
  range: string
): Promise<(string | number | boolean)[][]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google để đọc Google Sheet');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi đọc dữ liệu Google Sheet (${res.status})`);
  }
  const data = await res.json();
  return data.values || [];
};

export const updateSpreadsheetValues = async (
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google để cập nhật Google Sheet');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi cập nhật dữ liệu Google Sheet (${res.status})`);
  }
  return await res.json();
};

export const appendSpreadsheetValues = async (
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi thêm dữ liệu vào Google Sheet (${res.status})`);
  }
  return await res.json();
};

// --- Specialized Export to Google Sheets Helpers ---

/**
 * Xuất Bảng Xếp Loại Thi Đua trực tiếp lên Google Sheets trên Google Drive của người dùng
 */
export const exportEmulationToGoogleSheet = async (
  rankings: StudentEmulationItem[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const timestamp = new Date().toLocaleDateString('vi-VN');
  const title = `Bảng Xếp Loại Thi Đua - ${className} - ${periodName} (${timestamp})`;

  // Prepare formatted rows
  const rows: (string | number)[][] = [
    ['BẢNG TỔNG HỢP XẾP LOẠI THI ĐUA NỀ NẾP LỚP HỌC'],
    [`Lớp: ${className}`, `Kỳ thi đua: ${periodName}`, `Ngày xuất: ${timestamp}`, 'Hệ thống: EduMaster'],
    [],
    [
      'STT / Hạng',
      'Mã Học Sinh',
      'Họ Và Tên',
      'Lớp',
      'Điểm Khởi Điểm',
      'Điểm Cộng (+)',
      'Điểm Trừ (-)',
      'Tổng Điểm Thi Đua',
      'Xếp Loại Thi Đua',
      'Số Lần Khen',
      'Số Lần Nhắc Nhở',
      'Đánh Giá Chung',
    ],
  ];

  let totalPoints = 0;
  let totalPraises = 0;
  let totalWarnings = 0;

  rankings.forEach((item, index) => {
    totalPoints += item.netScore;
    totalPraises += item.praiseCount;
    totalWarnings += item.warnCount;

    rows.push([
      item.rank || index + 1,
      item.studentCode || item.studentId,
      item.studentName,
      className,
      item.baseScore,
      item.praisePoints,
      item.warnPoints,
      item.netScore,
      item.tier.name,
      item.praiseCount,
      item.warnCount,
      item.tier.description,
    ]);
  });

  const avgScore = rankings.length > 0 ? (totalPoints / rankings.length).toFixed(1) : '0';

  // Summary footer
  rows.push([]);
  rows.push(['TỔNG KẾT TOÀN LỚP']);
  rows.push(['Sĩ số học sinh:', rankings.length]);
  rows.push(['Điểm thi đua trung bình:', avgScore]);
  rows.push(['Tổng lượt khen thưởng (+):', totalPraises]);
  rows.push(['Tổng lượt vi phạm/nhắc nhở (-):', totalWarnings]);

  const spreadsheet = await createGoogleSpreadsheet(title, [
    {
      title: 'Bảng Xếp Loại',
      rows,
    },
  ]);

  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
  };
};

/**
 * Xuất Sổ Điểm Danh Chuyên Cần trực tiếp lên Google Sheets
 */
export const exportAttendanceToGoogleSheet = async (
  attendanceList: Attendance[],
  students: Student[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const timestamp = new Date().toLocaleDateString('vi-VN');
  const title = `Sổ Điểm Danh Chuyên Cần - ${className} - ${periodName} (${timestamp})`;

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const rows: (string | number)[][] = [
    ['SỔ THEO DÕI CHUYÊN CẦN VÀ ĐIỂM DANH HỌC SINH'],
    [`Lớp: ${className}`, `Thời gian: ${periodName}`, `Ngày xuất: ${timestamp}`],
    [],
    [
      'STT',
      'Ngày',
      'Mã Học Sinh',
      'Họ Và Tên',
      'Trạng Thái',
      'Lý Do / Ghi Chú',
      'Số Điện Thoại Phụ Huynh',
    ],
  ];

  attendanceList.forEach((att, idx) => {
    const student = studentMap.get(att.studentId);
    const statusLabel =
      att.status === 'PRESENT' || att.status === 'present'
        ? 'Có mặt'
        : att.status === 'ABSENT' || att.status === 'absent'
        ? 'Vắng mặt'
        : att.status === 'LATE' || att.status === 'late'
        ? 'Đi muộn'
        : 'Có phép';

    rows.push([
      idx + 1,
      att.date,
      student?.studentCode || att.studentId,
      att.studentName || student?.fullname || 'Học sinh',
      statusLabel,
      att.note || '',
      student?.phone || '',
    ]);
  });

  const spreadsheet = await createGoogleSpreadsheet(title, [
    {
      title: 'Điểm Danh',
      rows,
    },
  ]);

  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
  };
};

/**
 * Xuất Hồ Sơ Học Sinh & Phụ Huynh trực tiếp lên Google Sheets
 */
export const exportStudentsToGoogleSheet = async (
  students: Student[],
  parents: Parent[],
  className: string = '12A1'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const timestamp = new Date().toLocaleDateString('vi-VN');
  const title = `Danh Sách Học Sinh & Phụ Huynh - ${className} (${timestamp})`;

  const parentMap = new Map<string, Parent>();
  parents.forEach((p) => {
    if (p.studentId) parentMap.set(p.studentId, p);
    parentMap.set(p.id, p);
  });

  const rows: (string | number)[][] = [
    ['DANH SÁCH HỌC SINH VÀ THÔNG TIN PHỤ HUYNH LIÊN LẠC'],
    [`Lớp: ${className}`, `Sĩ số: ${students.length}`, `Ngày lập: ${timestamp}`],
    [],
    [
      'STT',
      'Mã Học Sinh',
      'Họ Và Tên',
      'Ngày Sinh',
      'Giới Tính',
      'Địa Chỉ',
      'Họ Tên Phụ Huynh',
      'Mối Quan Hệ',
      'Số ĐT Phụ Huynh',
      'Trạng Thái Học Tập',
    ],
  ];

  students.forEach((st, idx) => {
    const parent = parentMap.get(st.id) || (st.parentsId ? parentMap.get(st.parentsId) : undefined);
    const statusLabel =
      st.status === 'active'
        ? 'Đang học'
        : st.status === 'transferred'
        ? 'Chuyển trường'
        : 'Bảo lưu';

    rows.push([
      idx + 1,
      st.studentCode || `HS${String(idx + 1).padStart(3, '0')}`,
      st.fullname || (st as any).fullName || '',
      st.dob || '',
      st.gender === 'female' ? 'Nữ' : 'Nam',
      st.address || '',
      parent?.fullname || parent?.fullName || '',
      parent?.relationship || 'Bố/Mẹ',
      parent?.phone || st.phone || '',
      statusLabel,
    ]);
  });

  const spreadsheet = await createGoogleSpreadsheet(title, [
    {
      title: 'Danh Sách Học Sinh',
      rows,
    },
  ]);

  return {
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl,
  };
};
