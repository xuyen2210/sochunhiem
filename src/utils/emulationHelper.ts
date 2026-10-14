import * as XLSX from 'xlsx';
import { Behavior, EmulationCriterion, EmulationScaleConfig, EmulationTier, Student } from '../core/types';

export const DEFAULT_CRITERIA: EmulationCriterion[] = [
  // 1. Học tập & Chuyên môn
  {
    id: 'crit-ht-01',
    code: 'HT-01',
    title: 'Phát biểu xây dựng bài sôi nổi, đúng trọng tâm',
    category: 'Học tập & Chuyên môn',
    type: 'PRAISE',
    points: 2,
    description: 'Tích cực xung phong trả lời câu hỏi và tham gia thảo luận nhóm hiệu quả.',
    isActive: true,
  },
  {
    id: 'crit-ht-02',
    code: 'HT-02',
    title: 'Đạt điểm 9, 10 bài kiểm tra miệng / 15 phút',
    category: 'Học tập & Chuyên môn',
    type: 'PRAISE',
    points: 5,
    description: 'Có sự chuẩn bị bài kỹ lưỡng, đạt kết quả xuất sắc trong các bài kiểm tra thường xuyên.',
    isActive: true,
  },
  {
    id: 'crit-ht-03',
    code: 'HT-03',
    title: 'Đạt giải Học sinh giỏi các cấp / Nghiên cứu KHKT',
    category: 'Học tập & Chuyên môn',
    type: 'PRAISE',
    points: 15,
    description: 'Mang lại thành tích cao cho lớp và nhà trường trong các kỳ thi học thuật.',
    isActive: true,
  },
  {
    id: 'crit-ht-04',
    code: 'HT-04',
    title: 'Chủ động kèm cặp, giúp đỡ bạn cùng tiến trong học tập',
    category: 'Học tập & Chuyên môn',
    type: 'PRAISE',
    points: 5,
    description: 'Tổ chức hoặc tham gia nhóm đôi bạn cùng tiến, giúp đỡ bạn học lực yếu vươn lên.',
    isActive: true,
  },
  {
    id: 'crit-ht-05',
    code: 'HT-05',
    title: 'Không chuẩn bị bài / thiếu bài tập về nhà',
    category: 'Học tập & Chuyên môn',
    type: 'WARN',
    points: -2,
    description: 'Chưa hoàn thành nhiệm vụ học tập được giao trước giờ lên lớp.',
    isActive: true,
  },
  {
    id: 'crit-ht-06',
    code: 'HT-06',
    title: 'Quay cóp, gian lận trong kiểm tra',
    category: 'Học tập & Chuyên môn',
    type: 'WARN',
    points: -10,
    description: 'Vi phạm quy chế thi, thiếu trung thực trong học tập.',
    isActive: true,
  },

  // 2. Kỷ luật & Tác phong
  {
    id: 'crit-kl-01',
    code: 'KL-01',
    title: 'Gương mẫu chấp hành tốt nội quy, tác phong chuẩn mực',
    category: 'Kỷ luật & Tác phong',
    type: 'PRAISE',
    points: 3,
    description: 'Thực hiện nghiêm túc quy định của trường lớp, trang phục chỉnh tề suốt tuần.',
    isActive: true,
  },
  {
    id: 'crit-kl-02',
    code: 'KL-02',
    title: 'Không đúng đồng phục / quên phù hiệu, khăn quàng',
    category: 'Kỷ luật & Tác phong',
    type: 'WARN',
    points: -2,
    description: 'Sai quy định về đồng phục, giày dép hoặc thiếu bảng tên / phù hiệu.',
    isActive: true,
  },
  {
    id: 'crit-kl-03',
    code: 'KL-03',
    title: 'Mất trật tự, làm việc riêng trong giờ học',
    category: 'Kỷ luật & Tác phong',
    type: 'WARN',
    points: -2,
    description: 'Gây ồn ào, mất tập trung ảnh hưởng đến giáo viên và các bạn xung quanh.',
    isActive: true,
  },
  {
    id: 'crit-kl-04',
    code: 'KL-04',
    title: 'Sử dụng điện thoại di động khi chưa được phép',
    category: 'Kỷ luật & Tác phong',
    type: 'WARN',
    points: -5,
    description: 'Sử dụng thiết bị điện tử sai mục đích trong giờ học chính khóa.',
    isActive: true,
  },
  {
    id: 'crit-kl-05',
    code: 'KL-05',
    title: 'Nói tục, chửi thề hoặc có thái độ thiếu chuẩn mực',
    category: 'Kỷ luật & Tác phong',
    type: 'WARN',
    points: -5,
    description: 'Vi phạm văn hóa học đường, xưng hô hoặc hành vi thiếu tôn trọng.',
    isActive: true,
  },

  // 3. Chuyên cần & Nề nếp
  {
    id: 'crit-cc-01',
    code: 'CC-01',
    title: 'Chuyên cần 100% trong tháng, không nghỉ không trễ',
    category: 'Chuyên cần & Nề nếp',
    type: 'PRAISE',
    points: 5,
    description: 'Đi học đều đặn, đúng giờ, không có bất kỳ tiết vắng nào trong tháng thi đua.',
    isActive: true,
  },
  {
    id: 'crit-cc-02',
    code: 'CC-02',
    title: 'Đi học muộn / ra vào lớp tự do không xin phép',
    category: 'Chuyên cần & Nề nếp',
    type: 'WARN',
    points: -2,
    description: 'Đến trường sau khi trống báo giờ học hoặc ra ngoài không lý do chính đáng.',
    isActive: true,
  },
  {
    id: 'crit-cc-03',
    code: 'CC-03',
    title: 'Trốn tiết, bỏ giờ học không lý do',
    category: 'Chuyên cần & Nề nếp',
    type: 'WARN',
    points: -10,
    description: 'Tự ý bỏ tiết học, rời khỏi khuôn viên trường học.',
    isActive: true,
  },
  {
    id: 'crit-cc-04',
    code: 'CC-04',
    title: 'Nghỉ học không có đơn xin phép của phụ huynh',
    category: 'Chuyên cần & Nề nếp',
    type: 'WARN',
    points: -5,
    description: 'Vắng mặt không báo trước hoặc phụ huynh chưa liên hệ xác nhận.',
    isActive: true,
  },

  // 4. Phong trào & Hoạt động
  {
    id: 'crit-pt-01',
    code: 'PT-01',
    title: 'Tích cực tham gia văn nghệ, thể dục thể thao, báo tường',
    category: 'Phong trào & Hoạt động',
    type: 'PRAISE',
    points: 5,
    description: 'Đóng góp công sức và tài năng cho các phong trào thi đua của trường/lớp.',
    isActive: true,
  },
  {
    id: 'crit-pt-02',
    code: 'PT-02',
    title: 'Tham gia lao động, vệ sinh lớp học xuất sắc',
    category: 'Phong trào & Hoạt động',
    type: 'PRAISE',
    points: 3,
    description: 'Trực nhật sạch sẽ, chăm sóc bồn hoa cây cảnh hoặc bảo vệ tài sản công cộng.',
    isActive: true,
  },
  {
    id: 'crit-pt-03',
    code: 'PT-03',
    title: 'Đại diện lớp đạt giải phong trào Đoàn - Đội',
    category: 'Phong trào & Hoạt động',
    type: 'PRAISE',
    points: 10,
    description: 'Đạt giải trong các hội thi thanh niên làm theo lời Bác, rung chuông vàng, v.v.',
    isActive: true,
  },
  {
    id: 'crit-pt-04',
    code: 'PT-04',
    title: 'Không tham gia trực nhật / bỏ bê hoạt động tập thể',
    category: 'Phong trào & Hoạt động',
    type: 'WARN',
    points: -3,
    description: 'Thiếu trách nhiệm với tập thể khi được phân công nhiệm vụ chung.',
    isActive: true,
  },

  // 5. Đạo đức & Việc tốt
  {
    id: 'crit-vt-01',
    code: 'VT-01',
    title: 'Nhặt được của rơi trả lại người đánh mất / Việc tử tế',
    category: 'Đạo đức & Việc tốt',
    type: 'PRAISE',
    points: 10,
    description: 'Hành động trung thực, gương sáng học đường được biểu dương trước trường.',
    isActive: true,
  },
  {
    id: 'crit-vt-02',
    code: 'VT-02',
    title: 'Lễ phép, kính trọng thầy cô, đoàn kết giúp đỡ bạn',
    category: 'Đạo đức & Việc tốt',
    type: 'PRAISE',
    points: 3,
    description: 'Thái độ khiêm tốn, biết chào hỏi thầy cô giáo và hòa nhã với mọi người.',
    isActive: true,
  },
];

export const DEFAULT_SCALE_CONFIG: EmulationScaleConfig = {
  baseScore: 100, // Điểm khởi đầu chuẩn
  tiers: {
    excellentMin: 100, // Xuất sắc: >= 100 điểm
    goodMin: 85,       // Tốt: 85 - 99 điểm
    fairMin: 70,       // Khá: 70 - 84 điểm
    averageMin: 50,    // Trung bình: 50 - 69 điểm
    // Dưới averageMin là Cần rèn luyện (< 50)
  },
};

const STORAGE_KEY_CRITERIA = 'emulation_criteria_list_v1';
const STORAGE_KEY_CONFIG = 'emulation_scale_config_v1';

export function loadEmulationCriteria(): EmulationCriterion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CRITERIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load emulation criteria from storage', e);
  }
  return DEFAULT_CRITERIA;
}

export function saveEmulationCriteria(criteria: EmulationCriterion[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CRITERIA, JSON.stringify(criteria));
  } catch (e) {
    console.warn('Failed to save emulation criteria', e);
  }
}

export function loadScaleConfig(): EmulationScaleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.baseScore === 'number' && parsed.tiers) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load scale config from storage', e);
  }
  return DEFAULT_SCALE_CONFIG;
}

export function saveScaleConfig(config: EmulationScaleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save scale config', e);
  }
}

export function getTierFromScore(score: number, config: EmulationScaleConfig): EmulationTier {
  const { tiers } = config;
  if (score >= tiers.excellentMin) {
    return {
      id: 'excellent',
      name: 'Xuất sắc',
      minScore: tiers.excellentMin,
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200',
      badgeBg: 'bg-emerald-500',
      badgeText: 'text-emerald-700',
      description: `Đạt từ ${tiers.excellentMin} điểm trở lên - Gương mẫu tiêu biểu`,
    };
  }
  if (score >= tiers.goodMin) {
    return {
      id: 'good',
      name: 'Tốt',
      minScore: tiers.goodMin,
      color: 'blue',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-200',
      badgeBg: 'bg-blue-500',
      badgeText: 'text-blue-700',
      description: `Đạt từ ${tiers.goodMin} đến ${tiers.excellentMin - 1} điểm - Hoàn thành tốt nội quy`,
    };
  }
  if (score >= tiers.fairMin) {
    return {
      id: 'fair',
      name: 'Khá',
      minScore: tiers.fairMin,
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-amber-700',
      description: `Đạt từ ${tiers.fairMin} đến ${tiers.goodMin - 1} điểm - Cần tích cực hơn`,
    };
  }
  if (score >= tiers.averageMin) {
    return {
      id: 'average',
      name: 'Trung bình',
      minScore: tiers.averageMin,
      color: 'orange',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-300 ring-1 ring-orange-200',
      badgeBg: 'bg-orange-500',
      badgeText: 'text-orange-700',
      description: `Đạt từ ${tiers.averageMin} đến ${tiers.fairMin - 1} điểm - Còn vi phạm nề nếp`,
    };
  }
  return {
    id: 'needs_improvement',
    name: 'Cần rèn luyện',
    minScore: 0,
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-rose-700',
    description: `Dưới ${tiers.averageMin} điểm - Cần phối hợp phụ huynh giáo dục`,
  };
}

export interface StudentEmulationItem {
  student: Student;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  baseScore: number;
  praisePoints: number;
  warnPoints: number; // Điểm trừ (dạng âm hoặc dương, chúng ta lưu số điểm thực)
  netScore: number; // baseScore + praisePoints + warnPoints (warnPoints thường mang dấu âm)
  praiseCount: number;
  warnCount: number;
  tier: EmulationTier;
  rank: number;
  behaviors: Behavior[];
}

export interface EmulationSummaryStats {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  averageCount: number;
  needsImprovementCount: number;
  topStudent?: StudentEmulationItem;
}

export function computeEmulationRankings(
  students: Student[],
  behaviors: Behavior[],
  config: EmulationScaleConfig,
  filterClassId: string = 'all',
  timeFilter: 'all' | 'today' | 'week' | 'month' | 'custom' = 'all',
  customFrom: string = '',
  customTo: string = ''
): { list: StudentEmulationItem[]; stats: EmulationSummaryStats } {
  // Filter students by class
  const classStudents = students.filter((s) => {
    if (filterClassId === 'all') return true;
    return s.classId === filterClassId;
  });

  // Filter behaviors by time
  const filteredBehaviors = behaviors.filter((b) => {
    if (timeFilter === 'today') {
      return b.date === '2026-10-07';
    }
    if (timeFilter === 'week') {
      return b.date >= '2026-10-05' && b.date <= '2026-10-11';
    }
    if (timeFilter === 'month') {
      return b.date.startsWith('2026-10');
    }
    if (timeFilter === 'custom') {
      if (customFrom && b.date < customFrom) return false;
      if (customTo && b.date > customTo) return false;
      return true;
    }
    return true;
  });

  // Map each student to emulation points
  const rawList: Omit<StudentEmulationItem, 'rank'>[] = classStudents.map((st) => {
    const studentBehaviors = filteredBehaviors.filter((b) => b.studentId === st.id);
    let praisePoints = 0;
    let warnPoints = 0;
    let praiseCount = 0;
    let warnCount = 0;

    studentBehaviors.forEach((b) => {
      const typeStr = String(b.type).toUpperCase();
      const pts = Number(b.points || 0);

      if (typeStr === 'PRAISE') {
        praisePoints += pts > 0 ? pts : Math.abs(pts);
        praiseCount += 1;
      } else {
        // WARN / VIOLATION
        warnPoints += pts < 0 ? pts : -pts; // Ensure negative
        warnCount += 1;
      }
    });

    const netScore = config.baseScore + praisePoints + warnPoints;
    const tier = getTierFromScore(netScore, config);

    return {
      student: st,
      studentId: st.id,
      studentName: st.fullname || st.fullName || 'Học sinh',
      studentCode: st.studentCode || '',
      classId: st.classId,
      baseScore: config.baseScore,
      praisePoints,
      warnPoints,
      netScore,
      praiseCount,
      warnCount,
      tier,
      behaviors: studentBehaviors,
    };
  });

  // Sort by netScore DESC, then praisePoints DESC, then warnCount ASC
  rawList.sort((a, b) => {
    if (b.netScore !== a.netScore) {
      return b.netScore - a.netScore;
    }
    if (b.praisePoints !== a.praisePoints) {
      return b.praisePoints - a.praisePoints;
    }
    return a.warnCount - b.warnCount;
  });

  // Assign ranks
  const rankedList: StudentEmulationItem[] = rawList.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  // Compute stats
  const totalStudents = rankedList.length;
  const totalScore = rankedList.reduce((acc, item) => acc + item.netScore, 0);
  const averageScore = totalStudents > 0 ? Math.round((totalScore / totalStudents) * 10) / 10 : 0;
  const highestScore = totalStudents > 0 ? rankedList[0].netScore : 0;
  const lowestScore = totalStudents > 0 ? rankedList[rankedList.length - 1].netScore : 0;

  let excellentCount = 0;
  let goodCount = 0;
  let fairCount = 0;
  let averageCount = 0;
  let needsImprovementCount = 0;

  rankedList.forEach((item) => {
    switch (item.tier.id) {
      case 'excellent':
        excellentCount++;
        break;
      case 'good':
        goodCount++;
        break;
      case 'fair':
        fairCount++;
        break;
      case 'average':
        averageCount++;
        break;
      default:
        needsImprovementCount++;
        break;
    }
  });

  return {
    list: rankedList,
    stats: {
      totalStudents,
      averageScore,
      highestScore,
      lowestScore,
      excellentCount,
      goodCount,
      fairCount,
      averageCount,
      needsImprovementCount,
      topStudent: rankedList[0],
    },
  };
}

// Xuất Bảng Xếp Loại Thi Đua dạng Excel (.xlsx) chuẩn định dạng
export function exportEmulationRankingsExcel(
  list: StudentEmulationItem[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026',
  scaleConfig?: EmulationScaleConfig
): void {
  const sanitizedClass = (className || '12A1').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);

  // 1. Dòng tiêu đề
  const titleRow = [`BẢNG XẾP LOẠI THI ĐUA & NỀ NẾP HỌC SINH - LỚP ${(className || '').toUpperCase()}`];

  // 2. Dòng thông tin tổng quan
  const metaRow1 = [
    `Thời gian xét: ${periodName}`,
    `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
    `Tổng số học sinh: ${list.length}`,
    scaleConfig ? `Điểm xuất phát chuẩn: ${scaleConfig.baseScore} điểm` : 'Điểm chuẩn: 100 điểm',
  ];

  const totalStudents = list.length;
  const totalScore = list.reduce((acc, item) => acc + item.netScore, 0);
  const avgScore = totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : '0';
  const excCount = list.filter((i) => i.tier.id === 'excellent').length;
  const goodCount = list.filter((i) => i.tier.id === 'good').length;
  const fairCount = list.filter((i) => i.tier.id === 'fair').length;
  const avgCount = list.filter((i) => i.tier.id === 'average').length;
  const needCount = list.filter((i) => i.tier.id === 'needs_improvement').length;

  const metaRow2 = [
    `Điểm TB: ${avgScore}đ`,
    `Xuất sắc: ${excCount} HS (${totalStudents ? Math.round((excCount / totalStudents) * 100) : 0}%)`,
    `Tốt: ${goodCount} HS`,
    `Khá: ${fairCount} HS`,
    `Trung bình: ${avgCount} HS`,
    `Cần rèn luyện: ${needCount} HS`,
  ];

  const emptyRow: any[] = [];

  // 3. Tiêu đề các cột dữ liệu
  const headers = [
    'Hạng',
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
    'Đánh Giá Nề Nếp',
  ];

  // 4. Dữ liệu học sinh
  const rows = list.map((item) => {
    let note = '';
    if (item.tier.id === 'excellent') note = 'Xuất sắc, gương mẫu tiêu biểu';
    else if (item.tier.id === 'good') note = 'Nề nếp tốt, tích cực trong phong trào';
    else if (item.tier.id === 'fair') note = 'Chấp hành tương đối tốt nội quy';
    else if (item.tier.id === 'average') note = 'Cần cố gắng rèn luyện thêm';
    else note = 'Cần phối hợp gia đình theo dõi và rèn luyện';

    return [
      item.rank,
      item.studentCode || item.studentId,
      item.studentName,
      className,
      item.baseScore,
      item.praisePoints > 0 ? `+${item.praisePoints}` : 0,
      item.warnPoints,
      item.netScore,
      item.tier.name,
      item.praiseCount,
      item.warnCount,
      note,
    ];
  });

  // 5. Dòng tổng kết
  const summaryRow = [
    'TỔNG KẾT',
    '',
    `Sĩ số: ${totalStudents} HS`,
    className,
    scaleConfig?.baseScore || 100,
    list.reduce((acc, i) => acc + i.praisePoints, 0),
    list.reduce((acc, i) => acc + i.warnPoints, 0),
    `TB: ${avgScore}đ`,
    `XS: ${excCount} | Tốt: ${goodCount} | Khá: ${fairCount} | TB: ${avgCount} | Cần RL: ${needCount}`,
    list.reduce((acc, i) => acc + i.praiseCount, 0),
    list.reduce((acc, i) => acc + i.warnCount, 0),
    'Hệ Thống Sổ Liên Lạc Điện Tử',
  ];

  const wsData = [
    titleRow,
    metaRow1,
    metaRow2,
    emptyRow,
    headers,
    ...rows,
    emptyRow,
    summaryRow,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Hạng
    { wch: 16 }, // Mã Học Sinh
    { wch: 28 }, // Họ Và Tên
    { wch: 12 }, // Lớp
    { wch: 16 }, // Điểm Khởi Điểm
    { wch: 16 }, // Điểm Cộng (+)
    { wch: 16 }, // Điểm Trừ (-)
    { wch: 20 }, // Tổng Điểm Thi Đua
    { wch: 20 }, // Xếp Loại Thi Đua
    { wch: 14 }, // Số Lần Khen
    { wch: 16 }, // Số Lần Nhắc Nhở
    { wch: 42 }, // Đánh Giá Nề Nếp
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'XepLoaiThiDua');

  const fileName = `Bang_Xep_Loai_Thi_Dua_${sanitizedClass}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Xuất Sổ Ghi Nhận Thi Đua dạng Excel (.xlsx)
export function exportEmulationRecordsExcel(
  behaviors: Behavior[],
  students: Student[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026'
): void {
  const sanitizedClass = (className || '12A1').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);

  const titleRow = [`SỔ GHI NHẬN THI ĐUA & NỀ NẾP - LỚP ${(className || '').toUpperCase()}`];
  const metaRow = [
    `Thời gian: ${periodName}`,
    `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
    `Tổng số lượt ghi nhận: ${behaviors.length}`,
  ];
  const emptyRow: any[] = [];

  const headers = [
    'STT',
    'Mã Học Sinh',
    'Họ Và Tên',
    'Lớp',
    'Ngày Ghi Nhận',
    'Phân Loại',
    'Nội Dung / Tiêu Chí',
    'Điểm Thi Đua',
    'Ẩn Nhạy Cảm',
  ];

  const studentMap = new Map<string, string>();
  students.forEach((s) => studentMap.set(s.id, s.fullname || s.fullName || 'Học sinh'));

  const rows = behaviors.map((b, idx) => {
    const studentName = b.studentName || studentMap.get(b.studentId) || 'Học sinh';
    const isPraise = String(b.type).toUpperCase() === 'PRAISE';
    const typeText = isPraise ? 'Khen thưởng (+)' : 'Nhắc nhở (-)';
    const points = b.points ?? (isPraise ? 5 : -2);

    return [
      idx + 1,
      b.studentId,
      studentName,
      className,
      b.date || '',
      typeText,
      b.content || b.description || b.title || '',
      points,
      b.isSensitive ? 'Có' : 'Không',
    ];
  });

  const wsData = [
    titleRow,
    metaRow,
    emptyRow,
    headers,
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet['!cols'] = [
    { wch: 8 },  // STT
    { wch: 16 }, // Mã HS
    { wch: 28 }, // Họ tên
    { wch: 12 }, // Lớp
    { wch: 16 }, // Ngày
    { wch: 18 }, // Phân loại
    { wch: 45 }, // Nội dung
    { wch: 16 }, // Điểm
    { wch: 14 }, // Nhạy cảm
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SoGhiNhan');

  const fileName = `So_Ghi_Nhan_Thi_Dua_${sanitizedClass}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportEmulationRankingsCSV(
  list: StudentEmulationItem[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026'
): void {
  const headers = [
    'Hạng',
    'Mã Học Sinh',
    'Họ Và Tên',
    'Lớp',
    'Điểm Khởi Điểm',
    'Điểm Cộng (+)',
    'Điểm Trừ (-)',
    'Tổng Điểm Thi Đua',
    'Xếp Loại Thi Đua',
    'Số Lần Khen',
    'Số Lần Nhắc',
  ];

  const rows = list.map((item) => {
    return [
      item.rank,
      `"${item.studentCode}"`,
      `"${item.studentName}"`,
      `"${className}"`,
      item.baseScore,
      `+${item.praisePoints}`,
      item.warnPoints,
      item.netScore,
      `"${item.tier.name}"`,
      item.praiseCount,
      item.warnCount,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Xep_Loai_Thi_Dua_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEmulationRecordsCSV(
  behaviors: Behavior[],
  students: Student[],
  className: string = '12A1',
  periodName: string = 'Tháng 10/2026'
): void {
  const headers = [
    'STT',
    'Mã Học Sinh',
    'Họ Và Tên',
    'Lớp',
    'Ngày Ghi Nhận',
    'Phân Loại',
    'Nội Dung / Tiêu Chí',
    'Điểm Thi Đua',
    'Ẩn Nhạy Cảm',
  ];

  const studentMap = new Map<string, string>();
  students.forEach((s) => studentMap.set(s.id, s.fullname || s.fullName || 'Học sinh'));

  const rows = behaviors.map((b, idx) => {
    const studentName = b.studentName || studentMap.get(b.studentId) || 'Học sinh';
    const typeText = String(b.type).toUpperCase() === 'PRAISE' ? 'Khen thưởng (+)' : 'Nhắc nhở (-)';
    const content = (b.content || b.description || b.title || '').replace(/"/g, '""');

    return [
      idx + 1,
      `"${b.studentId}"`,
      `"${studentName}"`,
      `"${className}"`,
      `"${b.date || ''}"`,
      `"${typeText}"`,
      `"${content}"`,
      b.points ?? (String(b.type).toUpperCase() === 'PRAISE' ? 5 : -2),
      b.isSensitive ? 'Có' : 'Không',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `So_Ghi_Nhan_Thi_Dua_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
