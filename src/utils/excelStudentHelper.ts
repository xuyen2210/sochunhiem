import * as XLSX from 'xlsx';
import { ClassInfo, Parent, Student } from '../core/types';

export interface ParsedStudentRow {
  rowNumber: number;
  studentCode: string;
  fullname: string;
  classId: string;
  className: string;
  dob: string; // YYYY-MM-DD
  dobDisplay: string; // DD/MM/YYYY
  gender: 'male' | 'female';
  genderDisplay: string; // Nam / Nữ
  address: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelationship?: string;
  status: 'active' | 'transferred' | 'deferred';
  academicRank?: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
  conduct?: 'Tốt' | 'Khá' | 'Trung bình' | 'Chưa đạt';
  notes?: string;
  isValid: boolean;
  errors: string[];
}

// Convert Excel serial date or string date to YYYY-MM-DD and DD/MM/YYYY
export function parseExcelDate(val: any): { isoDate: string; displayDate: string } {
  if (!val) {
    return { isoDate: '2009-01-01', displayDate: '01/01/2009' };
  }

  // If val is already a Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return { isoDate: `${y}-${m}-${d}`, displayDate: `${d}/${m}/${y}` };
  }

  // If val is an Excel date serial number (e.g. 39948)
  if (typeof val === 'number') {
    try {
      const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getUTCDate()).padStart(2, '0');
        return { isoDate: `${y}-${m}-${d}`, displayDate: `${d}/${m}/${y}` };
      }
    } catch {
      // Fallback below
    }
  }

  const str = String(val).trim();
  // Format: DD/MM/YYYY or D/M/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return { isoDate: `${y}-${m}-${d}`, displayDate: `${d}/${m}/${y}` };
  }

  // Format: YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return { isoDate: `${y}-${m}-${d}`, displayDate: `${d}/${m}/${y}` };
  }

  // Default fallback
  return { isoDate: '2009-01-01', displayDate: str || '01/01/2009' };
}

// Normalize text for flexible column matching
function normalizeColHeader(header: any): string {
  if (!header) return '';
  return String(header)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics
    .replace(/[^a-z0-9]/g, ''); // keep only alphanumeric
}

// Download Excel Template for Students
export function downloadStudentTemplate(classes: ClassInfo[]): void {
  const defaultClassName = classes[0]?.classname || classes[0]?.name || '12A1';

  const headers = [
    'STT',
    'Mã Học Sinh',
    'Họ Và Tên (*)',
    'Lớp Học',
    'Ngày Sinh (DD/MM/YYYY)',
    'Giới Tính (Nam/Nữ)',
    'Địa Chỉ',
    'Số Điện Thoại',
    'Họ Tên Phụ Huynh',
    'SĐT Phụ Huynh',
    'Quan Hệ Phụ Huynh',
    'Trạng Thái',
    'Học Lực',
    'Hạnh Kiểm',
    'Ghi Chú',
  ];

  const sampleRows = [
    [
      1,
      'HS2026-001',
      'Nguyễn Văn An',
      defaultClassName,
      '15/05/2009',
      'Nam',
      'Khu vực 2, Phường Thuận An, TX Long Mỹ, Hậu Giang',
      '0912345678',
      'Nguyễn Văn Ba',
      '0908123456',
      'Bố',
      'Đang theo học',
      'Giỏi',
      'Tốt',
      'Lớp trưởng',
    ],
    [
      2,
      'HS2026-002',
      'Trần Thị Mai Anh',
      defaultClassName,
      '20/08/2009',
      'Nữ',
      'Ấp 4, Xã Long Trị, TX Long Mỹ, Hậu Giang',
      '0923456789',
      'Lê Thị Hương',
      '0918234567',
      'Mẹ',
      'Đang theo học',
      'Khá',
      'Tốt',
      'Bí thư chi đoàn',
    ],
    [
      3,
      'HS2026-003',
      'Lê Hoàng Nam',
      defaultClassName,
      '10/11/2009',
      'Nam',
      'Ấp Long Bình 1, Phường Long Phú, TX Long Mỹ',
      '0934567890',
      'Lê Văn Đạt',
      '0938345678',
      'Bố',
      'Đang theo học',
      'Khá',
      'Khá',
      'Tổ phó tổ 1',
    ],
    [
      4,
      'HS2026-004',
      'Phạm Thuỳ Linh',
      defaultClassName,
      '02/03/2009',
      'Nữ',
      'Khu vực Bình Thạnh B, Phường Bình Thạnh, TX Long Mỹ',
      '0945678901',
      'Phạm Quốc Tuấn',
      '0948456789',
      'Bố',
      'Đang theo học',
      'Giỏi',
      'Tốt',
      'Học sinh giỏi cấp tỉnh',
    ],
    [
      5,
      'HS2026-005',
      'Đỗ Tuấn Kiệt',
      defaultClassName,
      '25/12/2009',
      'Nam',
      'Ấp Tân Phú, Xã Tân Phú, TX Long Mỹ',
      '0956789012',
      'Nguyễn Thị Kim Loan',
      '0958567890',
      'Mẹ',
      'Đang theo học',
      'Trung bình',
      'Khá',
      'Thành viên đội bóng đá',
    ],
  ];

  const wsData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã HS
    { wch: 24 }, // Họ và tên
    { wch: 12 }, // Lớp học
    { wch: 18 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 35 }, // Địa chỉ
    { wch: 15 }, // SĐT
    { wch: 22 }, // Phụ huynh
    { wch: 16 }, // SĐT PH
    { wch: 16 }, // Quan hệ
    { wch: 16 }, // Trạng thái
    { wch: 12 }, // Học lực
    { wch: 12 }, // Hạnh kiểm
    { wch: 25 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');

  // Trigger download as .xlsx
  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh.xlsx');
}

// Export existing students list to .xlsx
export function exportStudentsToExcel(
  students: Student[],
  classes: ClassInfo[],
  parents: Parent[],
  filename = 'Danh_Sach_Hoc_Sinh.xlsx'
): void {
  const headers = [
    'STT',
    'Mã Học Sinh',
    'Họ Và Tên',
    'Lớp Học',
    'Ngày Sinh',
    'Giới Tính',
    'Địa Chỉ',
    'Số Điện Thoại',
    'Phụ Huynh Liên Kết',
    'SĐT Phụ Huynh',
    'Quan Hệ',
    'Trạng Thái',
    'Học Lực',
    'Hạnh Kiểm',
    'Ghi Chú',
  ];

  const rows = students.map((st, idx) => {
    const cls = classes.find((c) => c.id === st.classId);
    const parent = parents.find(
      (p) => p.id === (st.parentsId || st.parentId) || p.studentId === st.id
    );

    const statusText =
      st.status === 'transferred'
        ? 'Chuyển lớp/trường'
        : st.status === 'deferred'
        ? 'Bảo lưu/Nghỉ'
        : 'Đang theo học';

    return [
      idx + 1,
      st.studentCode || st.id,
      st.fullname || st.fullName || '',
      cls?.classname || cls?.name || st.classId,
      parseExcelDate(st.dob).displayDate,
      st.gender === 'female' ? 'Nữ' : 'Nam',
      st.address || '',
      st.phone || '',
      parent ? parent.fullname || parent.fullName : '',
      parent ? parent.phone : '',
      parent ? parent.relationship : '',
      statusText,
      st.academicRank || 'Khá',
      st.conduct || 'Tốt',
      st.notes || '',
    ];
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 24 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 35 },
    { wch: 15 },
    { wch: 22 },
    { wch: 16 },
    { wch: 15 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'HocSinh');
  XLSX.writeFile(workbook, filename);
}

// Parse student excel file (.xlsx or .xls)
export async function parseStudentExcelFile(
  file: File,
  classes: ClassInfo[],
  fallbackClassId: string
): Promise<{
  rows: ParsedStudentRow[];
  totalRows: number;
  validRows: number;
  sheetNames: string[];
  activeSheet: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('File Excel không có sheet dữ liệu nào.');
  }

  const activeSheet = sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rawData || rawData.length === 0) {
    throw new Error('Sheet dữ liệu trong file Excel đang để trống.');
  }

  // Find header row index
  let headerRowIndex = -1;
  for (let r = 0; r < Math.min(15, rawData.length); r++) {
    const row = rawData[r] || [];
    const hasNameCol = row.some((cell) => {
      const normalized = normalizeColHeader(cell);
      return (
        normalized.includes('hoten') ||
        normalized.includes('hovaten') ||
        normalized.includes('fullname') ||
        normalized.includes('tenhocsinh') ||
        normalized === 'ten'
      );
    });

    if (hasNameCol) {
      headerRowIndex = r;
      break;
    }
  }

  // If no explicit name header found, assume row 0 is header
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headerRow = rawData[headerRowIndex] || [];

  // Map column index to purpose
  const colIndexMap: Record<string, number> = {
    code: -1,
    fullname: -1,
    class: -1,
    dob: -1,
    gender: -1,
    address: -1,
    phone: -1,
    parentName: -1,
    parentPhone: -1,
    parentRelation: -1,
    status: -1,
    academicRank: -1,
    conduct: -1,
    notes: -1,
  };

  headerRow.forEach((colName, idx) => {
    const n = normalizeColHeader(colName);
    if (n.includes('mahocsinh') || n.includes('mahs') || n.includes('studentcode') || n === 'code') {
      colIndexMap.code = idx;
    } else if (
      n.includes('hovaten') ||
      n.includes('hoten') ||
      n.includes('fullname') ||
      n.includes('tenhocsinh') ||
      n === 'ten'
    ) {
      colIndexMap.fullname = idx;
    } else if (n.includes('lophoc') || n.includes('lop') || n.includes('class') || n.includes('classname')) {
      colIndexMap.class = idx;
    } else if (n.includes('ngaysinh') || n.includes('dob') || n.includes('birthdate')) {
      colIndexMap.dob = idx;
    } else if (n.includes('gioitinh') || n.includes('gender') || n.includes('sex') || n.includes('phai')) {
      colIndexMap.gender = idx;
    } else if (n.includes('diachi') || n.includes('address') || n.includes('quequan') || n.includes('noio')) {
      colIndexMap.address = idx;
    } else if (n.includes('sodienthoai') || n.includes('sdt') || n.includes('phone') || n.includes('tel')) {
      // Check if it's parent phone or student phone
      if (n.includes('phuhuynh') || n.includes('bo') || n.includes('me') || n.includes('chame')) {
        colIndexMap.parentPhone = idx;
      } else {
        colIndexMap.phone = idx;
      }
    } else if (
      n.includes('phuhuynh') ||
      n.includes('hotenph') ||
      n.includes('tenph') ||
      n.includes('parentname') ||
      n.includes('chame')
    ) {
      colIndexMap.parentName = idx;
    } else if (n.includes('quanhe') || n.includes('relationship')) {
      colIndexMap.parentRelation = idx;
    } else if (n.includes('trangthai') || n.includes('status')) {
      colIndexMap.status = idx;
    } else if (n.includes('hocluc') || n.includes('academic') || n.includes('xxeploai')) {
      colIndexMap.academicRank = idx;
    } else if (n.includes('hanhkiem') || n.includes('conduct') || n.includes('renluyen')) {
      colIndexMap.conduct = idx;
    } else if (n.includes('ghichu') || n.includes('note') || n.includes('notes')) {
      colIndexMap.notes = idx;
    }
  });

  // If fullname col wasn't found by normalization, use column 2 or 1
  if (colIndexMap.fullname === -1) {
    colIndexMap.fullname = headerRow.length > 2 ? 2 : 1;
  }

  const parsedRows: ParsedStudentRow[] = [];
  const dataRows = rawData.slice(headerRowIndex + 1);

  dataRows.forEach((row, rowIdx) => {
    // Skip completely empty rows
    if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      return;
    }

    const rawName = colIndexMap.fullname >= 0 ? row[colIndexMap.fullname] : '';
    const fullname = String(rawName || '').trim();

    const rawCode = colIndexMap.code >= 0 ? row[colIndexMap.code] : '';
    const studentCode = String(rawCode || '').trim();

    // Match class
    const rawClass = colIndexMap.class >= 0 ? row[colIndexMap.class] : '';
    const rawClassStr = String(rawClass || '').trim();
    let matchedClass = classes.find(
      (c) =>
        c.id === rawClassStr ||
        c.classname.toLowerCase() === rawClassStr.toLowerCase() ||
        (c.name && c.name.toLowerCase() === rawClassStr.toLowerCase())
    );

    // If still not matched, check if rawClassStr contains class name (e.g. "12A1" in "Lớp 12A1")
    if (!matchedClass && rawClassStr) {
      matchedClass = classes.find(
        (c) =>
          rawClassStr.toLowerCase().includes(c.classname.toLowerCase()) ||
          c.classname.toLowerCase().includes(rawClassStr.toLowerCase())
      );
    }

    const classId = matchedClass?.id || fallbackClassId || classes[0]?.id || 'cls-12a1';
    const className =
      matchedClass?.classname ||
      matchedClass?.name ||
      classes.find((c) => c.id === fallbackClassId)?.classname ||
      rawClassStr ||
      '12A1';

    // Parse date of birth
    const rawDob = colIndexMap.dob >= 0 ? row[colIndexMap.dob] : null;
    const { isoDate: dob, displayDate: dobDisplay } = parseExcelDate(rawDob);

    // Parse gender
    const rawGender = colIndexMap.gender >= 0 ? String(row[colIndexMap.gender] || '').trim().toLowerCase() : '';
    let gender: 'male' | 'female' = 'male';
    let genderDisplay = 'Nam';
    if (
      rawGender.includes('nu') ||
      rawGender.includes('nữ') ||
      rawGender.includes('female') ||
      rawGender.includes('gai') ||
      rawGender === '0'
    ) {
      gender = 'female';
      genderDisplay = 'Nữ';
    }

    // Address
    const rawAddress = colIndexMap.address >= 0 ? row[colIndexMap.address] : '';
    const address = String(rawAddress || '').trim() || 'TX Long Mỹ, Hậu Giang';

    // Phone
    const rawPhone = colIndexMap.phone >= 0 ? row[colIndexMap.phone] : '';
    const phone = rawPhone ? String(rawPhone).trim() : undefined;

    // Parent
    const rawParentName = colIndexMap.parentName >= 0 ? row[colIndexMap.parentName] : '';
    const parentName = rawParentName ? String(rawParentName).trim() : undefined;

    const rawParentPhone = colIndexMap.parentPhone >= 0 ? row[colIndexMap.parentPhone] : '';
    const parentPhone = rawParentPhone ? String(rawParentPhone).trim() : undefined;

    const rawParentRelation = colIndexMap.parentRelation >= 0 ? row[colIndexMap.parentRelation] : '';
    const parentRelationship = rawParentRelation ? String(rawParentRelation).trim() : 'Bố';

    // Status
    const rawStatus = colIndexMap.status >= 0 ? String(row[colIndexMap.status] || '').trim().toLowerCase() : '';
    let status: 'active' | 'transferred' | 'deferred' = 'active';
    if (rawStatus.includes('chuyen') || rawStatus.includes('transferred')) {
      status = 'transferred';
    } else if (rawStatus.includes('bao luu') || rawStatus.includes('nghi') || rawStatus.includes('deferred')) {
      status = 'deferred';
    }

    // Academic rank
    const rawAcademic = colIndexMap.academicRank >= 0 ? String(row[colIndexMap.academicRank] || '').trim() : '';
    let academicRank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Khá';
    if (rawAcademic.includes('Giỏi') || rawAcademic.includes('Gioi')) academicRank = 'Giỏi';
    else if (rawAcademic.includes('Trung bình') || rawAcademic.includes('TB')) academicRank = 'Trung bình';
    else if (rawAcademic.includes('Yếu') || rawAcademic.includes('Yeu')) academicRank = 'Yếu';

    // Conduct
    const rawConduct = colIndexMap.conduct >= 0 ? String(row[colIndexMap.conduct] || '').trim() : '';
    let conduct: 'Tốt' | 'Khá' | 'Trung bình' | 'Chưa đạt' = 'Tốt';
    if (rawConduct.includes('Khá') || rawConduct.includes('Kha')) conduct = 'Khá';
    else if (rawConduct.includes('Trung bình')) conduct = 'Trung bình';
    else if (rawConduct.includes('Chưa đạt')) conduct = 'Chưa đạt';

    // Notes
    const rawNotes = colIndexMap.notes >= 0 ? row[colIndexMap.notes] : '';
    const notes = rawNotes ? String(rawNotes).trim() : undefined;

    // Validation
    const errors: string[] = [];
    if (!fullname) {
      errors.push('Thiếu họ và tên học sinh');
    }

    const isValid = errors.length === 0;

    parsedRows.push({
      rowNumber: rowIdx + 1,
      studentCode,
      fullname,
      classId,
      className,
      dob,
      dobDisplay,
      gender,
      genderDisplay,
      address,
      phone,
      parentName,
      parentPhone,
      parentRelationship,
      status,
      academicRank,
      conduct,
      notes,
      isValid,
      errors,
    });
  });

  const validRows = parsedRows.filter((r) => r.isValid).length;

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validRows,
    sheetNames,
    activeSheet,
  };
}
