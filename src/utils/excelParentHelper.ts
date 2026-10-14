import * as XLSX from 'xlsx';
import { ClassInfo, Parent, Student } from '../core/types';

export interface ParsedParentRow {
  rowNumber: number;
  fullname: string;
  phone: string;
  relationship: 'Bố' | 'Mẹ' | 'Người giám hộ' | string;
  studentIdentifier: string; // raw input: code or student name
  matchedStudentId: string;
  matchedStudentName: string;
  matchedStudentCode: string;
  matchedStudentClassName?: string;
  email?: string;
  job?: string;
  notes?: string;
  isValid: boolean;
  errors: string[];
}

export interface ParentParseResult {
  rows: ParsedParentRow[];
  totalRows: number;
  validRows: number;
  sheetNames: string[];
  activeSheet: string;
}

// Normalize text for flexible column matching
function normalizeText(header: any): string {
  if (!header) return '';
  return String(header)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics
    .replace(/[^a-z0-9]/g, ''); // keep only alphanumeric
}

// Normalize relationship
export function normalizeRelationship(val: any): 'Bố' | 'Mẹ' | 'Người giám hộ' {
  if (!val) return 'Bố';
  const norm = normalizeText(val);
  if (norm.includes('me') || norm.includes('mother') || norm.includes('ba')) {
    return 'Mẹ';
  }
  if (norm.includes('giamho') || norm.includes('guardian') || norm.includes('nguoigiamho')) {
    return 'Người giám hộ';
  }
  return 'Bố';
}

// Clean and normalize phone number
export function cleanPhoneNumber(val: any): string {
  if (!val) return '';
  const str = String(val).replace(/[^0-9+]/g, '').trim();
  if (str.startsWith('+84')) {
    return '0' + str.slice(3);
  }
  return str;
}

// Download Excel Template for Parents
export function downloadParentTemplate(students: Student[], classes: ClassInfo[]): void {
  const headers = [
    'STT',
    'Họ Và Tên Phụ Huynh (*)',
    'Số Điện Thoại (*)',
    'Quan Hệ (Bố/Mẹ/Người giám hộ)',
    'Mã Học Sinh Hoặc Họ Tên Con (*)',
    'Lớp Của Con (Gợi ý)',
    'Email Liên Hệ',
    'Nghề Nghiệp',
    'Ghi Chú',
  ];

  // Prepare realistic sample rows using students currently in the system if available
  const sampleStudents = students.slice(0, 5);
  const sampleRows: any[][] = [];

  const defaultSamples = [
    {
      parentName: 'Nguyễn Văn Ba',
      phone: '0908123456',
      rel: 'Bố',
      studentCode: 'HS2026-001',
      studentName: 'Nguyễn Văn An',
      className: '12A1',
      email: 'vanba.nguyen@gmail.com',
      job: 'Kỹ sư xây dựng',
      note: 'Liên hệ giờ hành chính',
    },
    {
      parentName: 'Lê Thị Hương',
      phone: '0918234567',
      rel: 'Mẹ',
      studentCode: 'HS2026-002',
      studentName: 'Trần Thị Mai Anh',
      className: '12A1',
      email: 'huongle.tran@gmail.com',
      job: 'Giáo viên',
      note: 'Trưởng ban đại diện cha mẹ HS',
    },
    {
      parentName: 'Lê Văn Đạt',
      phone: '0938345678',
      rel: 'Bố',
      studentCode: 'HS2026-003',
      studentName: 'Lê Hoàng Nam',
      className: '12A1',
      email: 'datle.van@yahoo.com',
      job: 'Bác sĩ',
      note: '',
    },
    {
      parentName: 'Phạm Quốc Tuấn',
      phone: '0948456789',
      rel: 'Bố',
      studentCode: 'HS2026-004',
      studentName: 'Phạm Thuỳ Linh',
      className: '12A2',
      email: 'tuanpham.kd@gmail.com',
      job: 'Kinh doanh tự do',
      note: '',
    },
    {
      parentName: 'Nguyễn Thị Kim Loan',
      phone: '0958567890',
      rel: 'Mẹ',
      studentCode: 'HS2026-005',
      studentName: 'Đỗ Tuấn Kiệt',
      className: '12A2',
      email: 'kimloan.do@gmail.com',
      job: 'Kế toán trưởng',
      note: 'Hội phụ huynh lớp',
    },
  ];

  for (let i = 0; i < 5; i++) {
    const fallback = defaultSamples[i];
    const actualStudent = sampleStudents[i];
    const cls = actualStudent ? classes.find((c) => c.id === actualStudent.classId) : null;
    const className = cls?.classname || cls?.name || fallback.className;

    sampleRows.push([
      i + 1,
      fallback.parentName,
      fallback.phone,
      fallback.rel,
      actualStudent ? actualStudent.studentCode || actualStudent.fullname || actualStudent.fullName : fallback.studentCode,
      className,
      fallback.email,
      fallback.job,
      fallback.note,
    ]);
  }

  const wsData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 25 }, // Họ và tên PH
    { wch: 18 }, // SĐT
    { wch: 24 }, // Quan hệ
    { wch: 28 }, // Mã HS hoặc Tên con
    { wch: 18 }, // Lớp
    { wch: 26 }, // Email
    { wch: 22 }, // Nghề nghiệp
    { wch: 26 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachPhuHuynh');

  // Trigger file download
  XLSX.writeFile(workbook, 'Mau_Nhap_Phu_Huynh.xlsx');
}

// Parse Excel file for parents
export function parseParentsExcelFile(
  data: ArrayBuffer,
  students: Student[],
  classes: ClassInfo[],
  targetSheetName?: string
): ParentParseResult {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error('File Excel không có trang tính (Sheet) nào.');
  }

  const activeSheet = targetSheetName && sheetNames.includes(targetSheetName)
    ? targetSheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[activeSheet];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length === 0) {
    return {
      rows: [],
      totalRows: 0,
      validRows: 0,
      sheetNames,
      activeSheet,
    };
  }

  // Find header row by searching for keywords
  let headerRowIndex = -1;
  const colIndexMap = {
    fullname: -1,
    phone: -1,
    relationship: -1,
    studentIdentifier: -1,
    className: -1,
    email: -1,
    job: -1,
    notes: -1,
  };

  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const cellText = normalizeText(row[c]);
      if (cellText.includes('hoten') || cellText.includes('hovaten') || cellText.includes('tenphuhuynh') || cellText.includes('phuhuynh') || cellText.includes('fullname')) {
        if (!cellText.includes('hocsinh') && !cellText.includes('con')) {
          headerRowIndex = r;
          break;
        }
      }
    }
    if (headerRowIndex >= 0) break;
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headerRow = rawRows[headerRowIndex];

  // Map column indexes
  if (Array.isArray(headerRow)) {
    headerRow.forEach((col: any, idx: number) => {
      const norm = normalizeText(col);

      // Fullname
      if (
        (norm.includes('hoten') || norm.includes('hovaten') || norm.includes('phuhuynh') || norm.includes('fullname') || norm.includes('ten')) &&
        !norm.includes('hocsinh') && !norm.includes('con') && !norm.includes('lop')
      ) {
        if (colIndexMap.fullname === -1) colIndexMap.fullname = idx;
      }
      // Phone
      else if (norm.includes('sdt') || norm.includes('dienthoai') || norm.includes('phone') || norm.includes('didong') || norm.includes('tel')) {
        if (colIndexMap.phone === -1) colIndexMap.phone = idx;
      }
      // Relationship
      else if (norm.includes('quanhe') || norm.includes('moiquanhe') || norm.includes('relationship') || norm.includes('vaitro')) {
        if (colIndexMap.relationship === -1) colIndexMap.relationship = idx;
      }
      // Student identifier (code, name, studentId)
      else if (
        norm.includes('mahs') || norm.includes('mahocsinh') || norm.includes('tencon') || norm.includes('con') ||
        norm.includes('hocsinh') || norm.includes('student') || norm.includes('studentcode')
      ) {
        if (colIndexMap.studentIdentifier === -1) colIndexMap.studentIdentifier = idx;
      }
      // Class name
      else if (norm.includes('lop') || norm.includes('class') || norm.includes('lopcon')) {
        if (colIndexMap.className === -1) colIndexMap.className = idx;
      }
      // Email
      else if (norm.includes('email') || norm.includes('thu') || norm.includes('mail')) {
        if (colIndexMap.email === -1) colIndexMap.email = idx;
      }
      // Job
      else if (norm.includes('nghenghiep') || norm.includes('nghe') || norm.includes('job') || norm.includes('congviec')) {
        if (colIndexMap.job === -1) colIndexMap.job = idx;
      }
      // Notes
      else if (norm.includes('ghichu') || norm.includes('note') || norm.includes('diachi')) {
        if (colIndexMap.notes === -1) colIndexMap.notes = idx;
      }
    });
  }

  // Fallbacks if not matched by headers
  if (colIndexMap.fullname === -1) colIndexMap.fullname = 1;
  if (colIndexMap.phone === -1) colIndexMap.phone = 2;
  if (colIndexMap.relationship === -1) colIndexMap.relationship = 3;
  if (colIndexMap.studentIdentifier === -1) colIndexMap.studentIdentifier = 4;
  if (colIndexMap.className === -1) colIndexMap.className = 5;
  if (colIndexMap.email === -1) colIndexMap.email = 6;
  if (colIndexMap.job === -1) colIndexMap.job = 7;
  if (colIndexMap.notes === -1) colIndexMap.notes = 8;

  // Build lookup index for students
  const classMap = new Map<string, string>();
  classes.forEach((c) => {
    classMap.set(c.id, c.classname || c.name || '');
  });

  const parsedRows: ParsedParentRow[] = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.every((c) => c === '' || c === null || c === undefined)) {
      continue;
    }

    const rawFullname = colIndexMap.fullname >= 0 ? row[colIndexMap.fullname] : '';
    const fullname = String(rawFullname || '').trim();

    const rawPhone = colIndexMap.phone >= 0 ? row[colIndexMap.phone] : '';
    const phone = cleanPhoneNumber(rawPhone);

    const rawRel = colIndexMap.relationship >= 0 ? row[colIndexMap.relationship] : '';
    const relationship = normalizeRelationship(rawRel);

    const rawStudent = colIndexMap.studentIdentifier >= 0 ? row[colIndexMap.studentIdentifier] : '';
    const studentIdentifier = String(rawStudent || '').trim();

    const rawEmail = colIndexMap.email >= 0 ? row[colIndexMap.email] : '';
    const email = rawEmail ? String(rawEmail).trim() : undefined;

    const rawJob = colIndexMap.job >= 0 ? row[colIndexMap.job] : '';
    const job = rawJob ? String(rawJob).trim() : undefined;

    const rawNotes = colIndexMap.notes >= 0 ? row[colIndexMap.notes] : '';
    const notes = rawNotes ? String(rawNotes).trim() : undefined;

    // Match student:
    // 1. By studentCode exact or normalized
    // 2. By student ID
    // 3. By fullname exact
    // 4. By normalized name
    let matchedStudent: Student | undefined = undefined;
    if (studentIdentifier) {
      const normInput = normalizeText(studentIdentifier);

      // Match studentCode
      matchedStudent = students.find((s) => {
        if (s.studentCode && normalizeText(s.studentCode) === normInput) return true;
        return false;
      });

      // Match ID
      if (!matchedStudent) {
        matchedStudent = students.find((s) => s.id === studentIdentifier);
      }

      // Match exact full name
      if (!matchedStudent) {
        matchedStudent = students.find((s) => {
          const sName = s.fullname || s.fullName || '';
          return sName.toLowerCase().trim() === studentIdentifier.toLowerCase().trim();
        });
      }

      // Match normalized full name
      if (!matchedStudent) {
        matchedStudent = students.find((s) => {
          const sName = s.fullname || s.fullName || '';
          return normalizeText(sName) === normInput;
        });
      }
    }

    // If still no student matched, and student list is not empty, default to none or first if row specifies
    const matchedStudentId = matchedStudent ? matchedStudent.id : '';
    const matchedStudentName = matchedStudent ? (matchedStudent.fullname || matchedStudent.fullName || '') : '';
    const matchedStudentCode = matchedStudent ? (matchedStudent.studentCode || '') : '';
    const matchedStudentClassName = matchedStudent ? (classMap.get(matchedStudent.classId) || '') : '';

    // Validation
    const errors: string[] = [];
    if (!fullname) {
      errors.push('Thiếu họ và tên phụ huynh');
    }
    if (!phone) {
      errors.push('Thiếu số điện thoại liên hệ');
    } else if (phone.length < 8 || phone.length > 13) {
      errors.push('Số điện thoại không đúng định dạng');
    }
    if (!matchedStudentId) {
      if (!studentIdentifier) {
        errors.push('Chưa nhập mã học sinh hoặc tên con');
      } else {
        errors.push(`Không tìm thấy học sinh khớp với "${studentIdentifier}"`);
      }
    }

    const isValid = errors.length === 0;

    parsedRows.push({
      rowNumber: r + 1,
      fullname,
      phone,
      relationship,
      studentIdentifier,
      matchedStudentId,
      matchedStudentName,
      matchedStudentCode,
      matchedStudentClassName,
      email,
      job,
      notes,
      isValid,
      errors,
    });
  }

  const validRows = parsedRows.filter((r) => r.isValid).length;

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validRows,
    sheetNames,
    activeSheet,
  };
}

// Export Parents to Excel
export function exportParentsToExcel(parents: Parent[], students: Student[], classes: ClassInfo[]): void {
  const headers = [
    'STT',
    'Họ Và Tên Phụ Huynh',
    'Số Điện Thoại',
    'Mối Quan Hệ',
    'Mã Học Sinh',
    'Họ Tên Con',
    'Lớp',
    'Email',
    'Nghề Nghiệp',
  ];

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.classname || c.name || ''));

  const rows = parents.map((p, idx) => {
    const student = studentMap.get(p.studentId);
    const studentName = student ? (student.fullname || student.fullName) : (p.studentName || '');
    const studentCode = student?.studentCode || '';
    const className = student ? (classMap.get(student.classId) || '') : '';

    return [
      idx + 1,
      p.fullname || p.fullName || '',
      p.phone || '',
      p.relationship || 'Bố',
      studentCode,
      studentName,
      className,
      p.email || '',
      p.job || '',
    ];
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 24 }, // Họ tên PH
    { wch: 16 }, // SĐT
    { wch: 16 }, // Quan hệ
    { wch: 14 }, // Mã HS
    { wch: 24 }, // Con
    { wch: 12 }, // Lớp
    { wch: 25 }, // Email
    { wch: 20 }, // Nghề nghiệp
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachPhuHuynh');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Danh_Sach_Phu_Huynh_${today}.xlsx`);
}
