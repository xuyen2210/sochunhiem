import { DataProvider } from '../core/dataProvider';
import {
  Announcement,
  Attendance,
  Behavior,
  ClassInfo,
  Document,
  Message,
  MessageThread,
  Parent,
  Report,
  ReportStudentStat,
  ReportTaskStat,
  Student,
  Task,
  TaskReply,
  Thread,
  WeekComparisonItem,
} from '../core/types';

const STORAGE_KEY_PREFIX = 'gvcn_data_';

interface DatabaseSchema {
  classes: ClassInfo[];
  students: Student[];
  parents: Parent[];
  attendance: Attendance[];
  behaviors: Behavior[];
  announcements: Announcement[];
  tasks: Task[];
  taskReplies: TaskReply[];
  threads: MessageThread[];
  messages: Message[];
  documents: Document[];
  reports: Report[];
}

export const initialSeedData: DatabaseSchema = {
  classes: [
    {
      id: 'cls-12a1',
      classname: 'Lớp 12A1',
      name: 'Lớp 12A1',
      grade: 'Khối 12',
      schoolYear: '2026 - 2027',
      homeroomTeacher: 'Thầy Nguyễn Văn Xuyên',
      homeroomTeacherName: 'Thầy Nguyễn Văn Xuyên',
      note: 'Lớp mũi nhọn khối 12, thi đua dẫn đầu',
      room: 'Phòng 204 - Dãy A',
      totalStudents: 32,
      teacherPhone: '0918 345 678',
      teacherEmail: 'xuyennv.gdtxlongmy@haugiang.edu.vn',
      teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'cls-12a2',
      classname: 'Lớp 12A2',
      name: 'Lớp 12A2',
      grade: 'Khối 12',
      schoolYear: '2026 - 2027',
      homeroomTeacher: 'Cô Trần Kim Loan',
      homeroomTeacherName: 'Cô Trần Kim Loan',
      note: 'Lớp định hướng KH Xã hội & Ngoại ngữ',
      room: 'Phòng 205 - Dãy A',
      totalStudents: 30,
      teacherPhone: '0907 123 456',
      teacherEmail: 'loantk@haugiang.edu.vn',
      teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cls-11b1',
      classname: 'Lớp 11B1',
      name: 'Lớp 11B1',
      grade: 'Khối 11',
      schoolYear: '2026 - 2027',
      homeroomTeacher: 'Thầy Lê Hoàng Long',
      homeroomTeacherName: 'Thầy Lê Hoàng Long',
      note: 'Lớp đoàn kết, năng nổ trong các hoạt động phong trào',
      room: 'Phòng 102 - Dãy B',
      totalStudents: 35,
      teacherPhone: '0939 654 321',
      teacherEmail: 'longlh@haugiang.edu.vn',
    },
  ],
  students: [
    {
      id: 'std-01',
      classId: 'cls-12a1',
      studentCode: 'HS2026-001',
      fullname: 'Trần Minh Quân',
      fullName: 'Trần Minh Quân',
      gender: 'male',
      dob: '2009-03-15',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      address: 'Khu vực 2, Phường Thuận An, TX Long Mỹ, Hậu Giang',
      phone: '0939 112 233',
      parentsId: 'par-01',
      parentId: 'par-01',
      status: 'active',
      academicRank: 'Giỏi',
      conduct: 'Tốt',
      notes: 'Lớp trưởng, gương mẫu và nhiệt tình hỗ trợ các bạn.',
    },
    {
      id: 'std-02',
      classId: 'cls-12a1',
      studentCode: 'HS2026-002',
      fullname: 'Nguyễn Thị Mai Anh',
      fullName: 'Nguyễn Thị Mai Anh',
      gender: 'female',
      dob: '2009-08-22',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      address: 'Ấp 4, Xã Long Trị, TX Long Mỹ, Hậu Giang',
      phone: '0939 445 566',
      parentsId: 'par-02',
      parentId: 'par-02',
      status: 'active',
      academicRank: 'Giỏi',
      conduct: 'Tốt',
      notes: 'Lớp phó học tập, phụ trách hỗ trợ môn Toán và tiếng Anh.',
    },
    {
      id: 'std-03',
      classId: 'cls-12a1',
      studentCode: 'HS2026-003',
      fullname: 'Lê Hoàng Nam',
      fullName: 'Lê Hoàng Nam',
      gender: 'male',
      dob: '2009-01-10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      address: 'Ấp Long Bình, Long Phú, TX Long Mỹ',
      phone: '0978 778 899',
      parentsId: 'par-03',
      parentId: 'par-03',
      status: 'active',
      academicRank: 'Khá',
      conduct: 'Khá',
      notes: 'Có tiến bộ trong giờ Hóa, hay quên mang vở nháp.',
    },
    {
      id: 'std-04',
      classId: 'cls-12a1',
      studentCode: 'HS2026-004',
      fullname: 'Phạm Thuỳ Linh',
      fullName: 'Phạm Thuỳ Linh',
      gender: 'female',
      dob: '2009-11-05',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      address: 'Khu vực 3, Phường Bình Thạnh, TX Long Mỹ',
      phone: '0981 123 789',
      parentsId: 'par-04',
      parentId: 'par-04',
      status: 'active',
      academicRank: 'Giỏi',
      conduct: 'Tốt',
      notes: 'Thành viên đội tuyển học sinh giỏi Văn cấp Tỉnh.',
    },
    {
      id: 'std-05',
      classId: 'cls-12a1',
      studentCode: 'HS2026-005',
      fullname: 'Đỗ Tuấn Kiệt',
      fullName: 'Đỗ Tuấn Kiệt',
      gender: 'male',
      dob: '2009-06-18',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      address: 'Ấp 1, Xã Long Bình, Long Mỹ',
      phone: '0919 223 344',
      parentsId: 'par-05',
      parentId: 'par-05',
      status: 'active',
      academicRank: 'Khá',
      conduct: 'Tốt',
      notes: 'Tích cực tham gia hoạt động văn nghệ và thể thao.',
    },
    {
      id: 'std-06',
      classId: 'cls-12a1',
      studentCode: 'HS2026-006',
      fullname: 'Võ Ngọc Bích',
      fullName: 'Võ Ngọc Bích',
      gender: 'female',
      dob: '2009-04-12',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      address: 'Khu vực 1, Phường Vĩnh Tường, Long Mỹ',
      phone: '0908 998 877',
      parentsId: 'par-06',
      parentId: 'par-06',
      status: 'active',
      academicRank: 'Khá',
      conduct: 'Tốt',
      notes: 'Thủ quỹ của lớp, cẩn thận và chu đáo.',
    },
    {
      id: 'std-07',
      classId: 'cls-12a2',
      studentCode: 'HS2026-021',
      fullname: 'Ngô Thanh Tùng',
      fullName: 'Ngô Thanh Tùng',
      gender: 'male',
      dob: '2009-09-03',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      address: 'Phường Lương Tâm, Long Mỹ',
      phone: '0944 555 777',
      status: 'active',
      academicRank: 'Khá',
      conduct: 'Tốt',
      notes: 'Học sinh lớp 12A2',
    },
  ],
  parents: [
    {
      id: 'par-01',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      fullname: 'Bác Trần Văn Hùng',
      fullName: 'Bác Trần Văn Hùng',
      relationship: 'Bố',
      phone: '0913 888 777',
      email: 'tranhung.longmy@gmail.com',
      job: 'Kinh doanh nông sản',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'par-02',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      fullname: 'Cô Lê Thị Kim Ngân',
      fullName: 'Cô Lê Thị Kim Ngân',
      relationship: 'Mẹ',
      phone: '0909 666 555',
      email: 'kimngan.longtri@gmail.com',
      job: 'Giáo viên mầm non',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'par-03',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      fullname: 'Chú Lê Văn Phát',
      fullName: 'Chú Lê Văn Phát',
      relationship: 'Bố',
      phone: '0945 333 222',
      email: 'lephat.longphu@gmail.com',
      job: 'Cán bộ địa chính',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'par-04',
      studentId: 'std-04',
      studentName: 'Phạm Thuỳ Linh',
      fullname: 'Cô Phan Mỹ Dung',
      fullName: 'Cô Phan Mỹ Dung',
      relationship: 'Mẹ',
      phone: '0988 222 111',
      email: 'mydung.longmy@gmail.com',
      job: 'Dược sĩ',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'par-05',
      studentId: 'std-05',
      studentName: 'Đỗ Tuấn Kiệt',
      fullname: 'Chú Đỗ Minh Sang',
      fullName: 'Chú Đỗ Minh Sang',
      relationship: 'Bố',
      phone: '0912 345 999',
      email: 'minhsang.longbinh@gmail.com',
      job: 'Kỹ sư nông nghiệp',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'par-06',
      studentId: 'std-06',
      studentName: 'Võ Ngọc Bích',
      fullname: 'Cô Nguyễn Thị Hoa',
      fullName: 'Cô Nguyễn Thị Hoa',
      relationship: 'Mẹ',
      phone: '0903 444 888',
      email: 'thihoa.vinhtuong@gmail.com',
      job: 'Công chức',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
  ],
  attendance: [
    {
      id: 'att-01',
      classId: 'cls-12a1',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      date: '2026-10-07',
      status: 'PRESENT',
      note: 'Đúng giờ',
      updatedAt: '2026-10-07T07:15:00Z',
    },
    {
      id: 'att-02',
      classId: 'cls-12a1',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      date: '2026-10-07',
      status: 'PRESENT',
      note: 'Chuẩn bị bài tốt',
      updatedAt: '2026-10-07T07:15:00Z',
    },
    {
      id: 'att-03',
      classId: 'cls-12a1',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      date: '2026-10-07',
      status: 'LATE',
      note: 'Trễ 10 phút (xe hỏng)',
      updatedAt: '2026-10-07T07:25:00Z',
    },
    {
      id: 'att-04',
      classId: 'cls-12a1',
      studentId: 'std-04',
      studentName: 'Phạm Thuỳ Linh',
      date: '2026-10-07',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-07T07:15:00Z',
    },
    {
      id: 'att-05',
      classId: 'cls-12a1',
      studentId: 'std-05',
      studentName: 'Đỗ Tuấn Kiệt',
      date: '2026-10-07',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-07T07:15:00Z',
    },
    {
      id: 'att-06',
      classId: 'cls-12a1',
      studentId: 'std-06',
      studentName: 'Võ Ngọc Bích',
      date: '2026-10-07',
      status: 'ABSENT',
      note: 'Phụ huynh có xin phép đi khám bệnh',
      updatedAt: '2026-10-07T07:05:00Z',
    },
    // Historical date 2026-10-06
    {
      id: 'att-h-01',
      classId: 'cls-12a1',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      date: '2026-10-06',
      status: 'PRESENT',
      note: 'Trực nhật lớp',
      updatedAt: '2026-10-06T07:10:00Z',
    },
    {
      id: 'att-h-02',
      classId: 'cls-12a1',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      date: '2026-10-06',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-06T07:12:00Z',
    },
    {
      id: 'att-h-03',
      classId: 'cls-12a1',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      date: '2026-10-06',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-06T07:15:00Z',
    },
    {
      id: 'att-h-04',
      classId: 'cls-12a1',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      date: '2026-10-05',
      status: 'PRESENT',
      note: 'Chào cờ đầu tuần',
      updatedAt: '2026-10-05T07:00:00Z',
    },
    {
      id: 'att-h-05',
      classId: 'cls-12a1',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      date: '2026-10-05',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-05T07:00:00Z',
    },
    {
      id: 'att-h-06',
      classId: 'cls-12a1',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      date: '2026-10-05',
      status: 'LATE',
      note: 'Đi muộn 5 phút',
      updatedAt: '2026-10-05T07:05:00Z',
    },
    {
      id: 'att-h-07',
      classId: 'cls-12a1',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      date: '2026-10-02',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-02T07:15:00Z',
    },
    {
      id: 'att-h-08',
      classId: 'cls-12a1',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      date: '2026-10-02',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-02T07:15:00Z',
    },
    {
      id: 'att-h-09',
      classId: 'cls-12a1',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      date: '2026-10-02',
      status: 'ABSENT',
      note: 'Nghỉ ốm',
      updatedAt: '2026-10-02T07:10:00Z',
    },
    {
      id: 'att-h-10',
      classId: 'cls-12a1',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      date: '2026-10-01',
      status: 'PRESENT',
      note: '',
      updatedAt: '2026-10-01T07:15:00Z',
    },
  ],
  behaviors: [
    {
      id: 'beh-01',
      studentId: 'std-01',
      studentName: 'Trần Minh Quân',
      classId: 'cls-12a1',
      date: '2026-10-06',
      type: 'PRAISE',
      content: 'Chủ động tổ chức nhóm ôn tập môn Toán cho các bạn học lực trung bình trong tuần thi đua.',
      title: 'Hỗ trợ bạn bè trong tuần thi đua',
      description: 'Chủ động tổ chức nhóm ôn tập môn Toán cho các bạn học lực trung bình.',
      points: 5,
      createdAt: '2026-10-06T15:30:00Z',
    },
    {
      id: 'beh-02',
      studentId: 'std-04',
      studentName: 'Phạm Thuỳ Linh',
      classId: 'cls-12a1',
      date: '2026-10-05',
      type: 'PRAISE',
      content: 'Đại diện lớp đạt giải Nhất cuộc thi tìm hiểu truyền thống nhà trường cấp thị xã.',
      title: 'Đạt giải Nhất thi viết văn cảm nghĩ',
      description: 'Đại diện lớp đạt giải Nhất cuộc thi tìm hiểu truyền thống nhà trường.',
      points: 10,
      createdAt: '2026-10-05T09:00:00Z',
    },
    {
      id: 'beh-03',
      studentId: 'std-03',
      studentName: 'Lê Hoàng Nam',
      classId: 'cls-12a1',
      date: '2026-10-07',
      type: 'WARN',
      content: 'Đi học muộn 10 phút và chưa mang đủ phù hiệu đồng phục đầu giờ.',
      title: 'Đi học muộn và quên đồng phục',
      description: 'Nhắc nhở học sinh cần dậy sớm hơn, chuẩn bị sẵn phù hiệu và khăn quàng/áo đồng phục.',
      points: -2,
      createdAt: '2026-10-07T08:00:00Z',
    },
    {
      id: 'beh-04',
      studentId: 'std-02',
      studentName: 'Nguyễn Thị Mai Anh',
      classId: 'cls-12a1',
      date: '2026-10-03',
      type: 'PRAISE',
      content: 'Đóng góp tích cực vào bảng tin học tập và hỗ trợ giải bài tập tiếng Anh cho lớp.',
      title: 'Tích cực hỗ trợ học tập',
      points: 5,
      createdAt: '2026-10-03T10:00:00Z',
    },
    {
      id: 'beh-05',
      studentId: 'std-05',
      studentName: 'Đỗ Tuấn Kiệt',
      classId: 'cls-12a1',
      date: '2026-10-02',
      type: 'WARN',
      content: 'Mất trật tự trong giờ tự quản sinh hoạt lớp, đã nhắc nhở rút kinh nghiệm.',
      title: 'Mất trật tự giờ tự quản',
      points: -2,
      createdAt: '2026-10-02T14:00:00Z',
    },
    {
      id: 'beh-06',
      studentId: 'std-06',
      studentName: 'Võ Ngọc Bích',
      classId: 'cls-12a1',
      date: '2026-09-28',
      type: 'WARN',
      content: 'Cần lưu ý về quy chế bảo quản chứng từ kiểm kê tài chính của học sinh.',
      title: 'Nhắc nhở công tác kiểm quỹ lớp',
      points: -1,
      isSensitive: true,
      createdAt: '2026-09-28T16:00:00Z',
    },
  ],
  announcements: [
    {
      id: 'ann-01',
      classId: 'cls-12a1',
      title: 'Thông báo: Kế hoạch chụp ảnh thẻ & hồ sơ dự thi Tốt nghiệp THPT 2027',
      content: 'Nhà trường sẽ tổ chức chụp ảnh chân dung và làm hồ sơ điện tử vào thứ Bảy tuần này. Các em học sinh chuẩn bị trang phục sơ mi trắng lịch sự hoặc sử dụng tính năng AI Headshot Studio tích hợp của lớp để xuất file ảnh chuẩn kích thước 4x6 nền xám/xanh.',
      target: 'all',
      pinned: true,
      isPinned: true,
      category: 'urgent',
      authorName: 'Thầy Nguyễn Văn Xuyên',
      authorRole: 'GVCN Lớp 12A1',
      createdAt: '2026-10-06T08:00:00Z',
      viewCount: 48,
    },
    {
      id: 'ann-02',
      classId: 'cls-12a1',
      title: 'Lịch kiểm tra giữa học kỳ 1 và họp phụ huynh định kỳ',
      content: 'Kính gửi quý phụ huynh và các em học sinh. Kỳ thi giữa kỳ 1 sẽ diễn ra từ ngày 20/10 đến 25/10. Buổi họp phụ huynh trực tuyến sẽ được tổ chức vào tối Chủ nhật 26/10 lúc 19:30 qua phòng học trường.',
      target: 'parent',
      pinned: false,
      isPinned: false,
      category: 'general',
      authorName: 'Thầy Nguyễn Văn Xuyên',
      authorRole: 'GVCN Lớp 12A1',
      createdAt: '2026-10-03T14:20:00Z',
      viewCount: 65,
    },
    {
      id: 'ann-03',
      classId: 'cls-12a1',
      title: 'Đăng ký tham gia giải bóng đá truyền thống chào mừng 20/11',
      content: 'Lớp 12A1 thành lập đội bóng đá mini nam và cầu lông nữ. Các bạn học sinh liên hệ lớp trưởng Minh Quân để lập danh sách tập luyện sau giờ học.',
      target: 'student',
      pinned: false,
      isPinned: false,
      category: 'activity',
      authorName: 'Trần Minh Quân',
      authorRole: 'Lớp trưởng',
      createdAt: '2026-10-01T10:00:00Z',
      viewCount: 39,
    },
  ],
  tasks: [
    {
      id: 'tsk-01',
      classId: 'cls-12a1',
      title: 'Nộp ảnh chân dung thẻ học sinh & cập nhật số CCCD',
      description: 'Học sinh kiểm tra thông tin định danh cá nhân và nộp 01 ảnh chân dung chất lượng cao (hoặc tạo qua Studio AI Headshot) để hoàn tất hồ sơ quản lý lớp.',
      dueDate: '2026-10-15',
      requireReply: true,
      subject: 'Sinh hoạt lớp',
      priority: 'high',
      createdAt: '2026-10-05T09:00:00Z',
      repliesCount: 4,
    },
    {
      id: 'tsk-02',
      classId: 'cls-12a1',
      title: 'Hoàn thành đề cương ôn tập môn Toán chương 1 (Đạo hàm)',
      description: 'Làm bài tập số 1 đến 15 trang 42 trong tài liệu phát đầu tuần, nộp ảnh bài giải hoặc link Google Drive/PDF.',
      dueDate: '2026-10-12',
      requireReply: true,
      subject: 'Toán học',
      priority: 'medium',
      createdAt: '2026-10-04T11:00:00Z',
      repliesCount: 6,
    },
    {
      id: 'tsk-03',
      classId: 'cls-12a1',
      title: 'Phiếu khảo sát nguyện vọng định hướng nghề nghiệp và tổ hợp thi',
      description: 'Điền phiếu khảo sát ý kiến gia đình và định hướng chọn ngành đại học / học nghề năm 2027.',
      dueDate: '2026-10-20',
      requireReply: false,
      subject: 'Hướng nghiệp',
      priority: 'medium',
      createdAt: '2026-10-02T16:00:00Z',
      repliesCount: 0,
    },
    {
      id: 'tsk-04',
      classId: 'cls-12a1',
      title: 'Nộp biên nhận học phí và bảo hiểm y tế kỳ 1',
      description: 'Học sinh hoặc phụ huynh chụp ảnh biên nhận/chuyển khoản gửi lại GVCN để đối soát danh sách nhà trường.',
      dueDate: '2026-10-01',
      requireReply: true,
      subject: 'Tài chính - Hồ sơ',
      priority: 'high',
      createdAt: '2026-09-20T08:00:00Z',
      repliesCount: 2,
    },
  ],
  taskReplies: [
    {
      id: 'rpl-01',
      taskId: 'tsk-01',
      studentId: 'std-01',
      parentId: 'par-01',
      replyText: 'Em đã cập nhật số CCCD: 093209001234 và ảnh thẻ chụp áo sơ mi trắng ạ.',
      attachmentsJson: '["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"]',
      createdAt: '2026-10-06T10:15:00Z',
      studentName: 'Trần Minh Quân',
      content: 'Em đã cập nhật số CCCD: 093209001234 và ảnh thẻ chụp áo sơ mi trắng ạ.',
      fileUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      fileName: 'anh_the_quan_12a1.jpg',
      submittedAt: '2026-10-06T10:15:00Z',
      score: 10,
      teacherFeedback: 'Thông tin đầy đủ, ảnh chụp nghiêm túc rõ nét.',
    },
    {
      id: 'rpl-02',
      taskId: 'tsk-01',
      studentId: 'std-02',
      parentId: 'par-02',
      replyText: 'Em gửi thầy file ảnh thẻ chân dung nền xám chuẩn hồ sơ tốt nghiệp ạ.',
      attachmentsJson: '["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"]',
      createdAt: '2026-10-06T14:30:00Z',
      studentName: 'Nguyễn Thị Mai Anh',
      content: 'Em gửi thầy file ảnh thẻ chân dung nền xám chuẩn hồ sơ tốt nghiệp ạ.',
      fileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      fileName: 'anh_the_mai_anh.jpg',
      submittedAt: '2026-10-06T14:30:00Z',
      score: 10,
      teacherFeedback: 'Rất tốt!',
    },
  ],
  threads: [
    {
      id: 'thr-cls-12a1',
      threadKey: 'cls-12a1',
      participantsJson: JSON.stringify([
        { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
        { role: 'ALL', name: 'Tập thể Lớp 12A1' },
      ]),
      lastMessageAt: '2026-10-07T08:15:00Z',
      classId: 'cls-12a1',
      participantName: 'Kênh Trao Đổi Chung - Lớp 12A1',
      participantRole: 'Tập thể lớp',
      lastMessage: 'Dạ chúng em đã chuẩn bị đầy đủ rồi thầy ạ!',
      lastMessageTime: '2026-10-07T08:15:00Z',
      unreadCount: 0,
    },
    {
      id: 'thr-01',
      threadKey: 'std-01',
      participantsJson: JSON.stringify([
        { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
        { role: 'PARENT', name: 'Bác Trần Văn Hùng' },
        { role: 'STUDENT', name: 'Trần Minh Quân' },
      ]),
      lastMessageAt: '2026-10-06T19:40:00Z',
      classId: 'cls-12a1',
      parentId: 'par-01',
      studentId: 'std-01',
      participantName: 'Bác Trần Văn Hùng (Bố Minh Quân)',
      participantRole: 'Phụ huynh',
      lastMessage: 'Dạ chào thầy, gia đình đã nhận được lịch thi giữa kỳ của cháu. Cảm ơn thầy!',
      lastMessageTime: '2026-10-06T19:40:00Z',
      unreadCount: 0,
    },
    {
      id: 'thr-02',
      threadKey: 'std-02',
      participantsJson: JSON.stringify([
        { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
        { role: 'PARENT', name: 'Cô Lê Thị Kim Ngân' },
        { role: 'STUDENT', name: 'Nguyễn Thị Mai Anh' },
      ]),
      lastMessageAt: '2026-10-05T20:10:00Z',
      classId: 'cls-12a1',
      parentId: 'par-02',
      studentId: 'std-02',
      participantName: 'Cô Lê Thị Kim Ngân (Mẹ Mai Anh)',
      participantRole: 'Phụ huynh',
      lastMessage: 'Thưa thầy, cháu Mai Anh muốn đăng ký thi khối D1 thì ôn thêm phần nào ạ?',
      lastMessageTime: '2026-10-05T20:10:00Z',
      unreadCount: 1,
    },
    {
      id: 'thr-03',
      threadKey: 'std-03',
      participantsJson: JSON.stringify([
        { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
        { role: 'PARENT', name: 'Chú Lê Văn Phát' },
        { role: 'STUDENT', name: 'Lê Hoàng Nam' },
      ]),
      lastMessageAt: '2026-10-07T07:10:00Z',
      classId: 'cls-12a1',
      parentId: 'par-03',
      studentId: 'std-03',
      participantName: 'Chú Lê Văn Phát (Bố Hoàng Nam)',
      participantRole: 'Phụ huynh',
      lastMessage: 'Thầy cho tôi xin phép cho cháu Nam sáng nay trễ chút vì xe cháu bị thủng lốp.',
      lastMessageTime: '2026-10-07T07:10:00Z',
      unreadCount: 0,
    },
  ],
  messages: [
    {
      id: 'msg-01',
      threadId: 'thr-01',
      fromRole: 'TEACHER',
      content: 'Chào bác Hùng, em Minh Quân tuần qua học tập rất chăm chỉ và năng nổ dẫn dắt lớp. Bác và gia đình hoàn toàn yên tâm nhé!',
      createdAt: '2026-10-06T18:15:00Z',
      senderId: 'teacher-xuyen',
      senderName: 'Thầy Nguyễn Văn Xuyên',
      senderRole: 'teacher',
    },
    {
      id: 'msg-02',
      threadId: 'thr-01',
      fromRole: 'PARENT',
      content: 'Dạ chào thầy, gia đình đã nhận được lịch thi giữa kỳ của cháu. Cảm ơn thầy nhiều ạ!',
      createdAt: '2026-10-06T19:40:00Z',
      senderId: 'par-01',
      senderName: 'Bác Trần Văn Hùng',
      senderRole: 'parent',
    },
    {
      id: 'msg-03',
      threadId: 'thr-02',
      fromRole: 'PARENT',
      content: 'Thưa thầy, cháu Mai Anh muốn đăng ký thi khối D1 thì ôn thêm phần nào ạ?',
      createdAt: '2026-10-05T20:10:00Z',
      senderId: 'par-02',
      senderName: 'Cô Lê Thị Kim Ngân',
      senderRole: 'parent',
    },
    {
      id: 'msg-04',
      threadId: 'thr-cls-12a1',
      fromRole: 'TEACHER',
      content: 'Chào cả lớp, các em chú ý mang theo máy tính cầm tay và phiếu báo danh cho tiết kiểm tra Toán sáng thứ 5 nhé.',
      createdAt: '2026-10-07T08:00:00Z',
      senderId: 'teacher-xuyen',
      senderName: 'Thầy Nguyễn Văn Xuyên',
      senderRole: 'teacher',
    },
    {
      id: 'msg-05',
      threadId: 'thr-cls-12a1',
      fromRole: 'STUDENT',
      content: 'Dạ chúng em đã chuẩn bị đầy đủ rồi thầy ạ!',
      createdAt: '2026-10-07T08:15:00Z',
      senderId: 'std-01',
      senderName: 'Trần Minh Quân',
      senderRole: 'student',
    },
  ],
  documents: [
    {
      id: 'doc-01',
      classId: 'cls-12a1',
      title: 'Thời khóa biểu Học kỳ 1 (Áp dụng từ 15/09)',
      url: 'https://storage.googleapis.com/edumaster-demo/thoi-khoa-bieu-12a1-hk1.pdf',
      category: 'plans',
      createdAt: '2026-09-15T08:00:00Z',
      fileUrl: 'https://storage.googleapis.com/edumaster-demo/thoi-khoa-bieu-12a1-hk1.pdf',
      fileSize: '1.2 MB (PDF)',
      uploadedBy: 'Thầy Xuyên (GVCN)',
      uploadedAt: '2026-09-15T08:00:00Z',
    },
    {
      id: 'doc-02',
      classId: 'cls-12a1',
      title: 'Nội quy lớp học và tiêu chí thi đua khen thưởng 2026-2027',
      url: 'https://storage.googleapis.com/edumaster-demo/noi-quy-lop-12a1.pdf',
      category: 'rules',
      createdAt: '2026-09-18T10:30:00Z',
      fileUrl: 'https://storage.googleapis.com/edumaster-demo/noi-quy-lop-12a1.pdf',
      fileSize: '850 KB (PDF)',
      uploadedBy: 'Ban cán sự lớp',
      uploadedAt: '2026-09-18T10:30:00Z',
    },
    {
      id: 'doc-03',
      classId: 'cls-12a1',
      title: 'Mẫu đơn xin phép nghỉ học có xác nhận của phụ huynh',
      url: 'https://storage.googleapis.com/edumaster-demo/mau-don-xin-nghi-hoc.docx',
      category: 'forms',
      createdAt: '2026-09-20T14:00:00Z',
      fileUrl: 'https://storage.googleapis.com/edumaster-demo/mau-don-xin-nghi-hoc.docx',
      fileSize: '320 KB (DOCX)',
      uploadedBy: 'Thầy Xuyên (GVCN)',
      uploadedAt: '2026-09-20T14:00:00Z',
    },
    {
      id: 'doc-04',
      classId: 'cls-12a1',
      title: 'Tài liệu hướng dẫn quy cách ảnh thẻ căn cước và hồ sơ tốt nghiệp',
      url: 'https://storage.googleapis.com/edumaster-demo/huong-dan-anh-the-cccd.pdf',
      category: 'plans',
      createdAt: '2026-10-01T09:15:00Z',
      fileUrl: 'https://storage.googleapis.com/edumaster-demo/huong-dan-anh-the-cccd.pdf',
      fileSize: '2.4 MB (PDF)',
      uploadedBy: 'Ban Giám hiệu',
      uploadedAt: '2026-10-01T09:15:00Z',
    },
    {
      id: 'doc-05',
      classId: 'cls-12a1',
      title: 'Kế hoạch ôn tập và đề cương kiểm tra giữa học kỳ 1 các môn',
      url: 'https://storage.googleapis.com/edumaster-demo/de-cuong-on-tap-hk1-12a1.pdf',
      category: 'curriculum',
      createdAt: '2026-10-04T15:20:00Z',
      fileUrl: 'https://storage.googleapis.com/edumaster-demo/de-cuong-on-tap-hk1-12a1.pdf',
      fileSize: '3.1 MB (PDF)',
      uploadedBy: 'Tổ Chuyên Môn',
      uploadedAt: '2026-10-04T15:20:00Z',
    },
  ],
  reports: [
    {
      id: 'rep-01',
      classId: 'cls-12a1',
      type: 'weekly',
      periodLabel: 'Tuần 05 (Tháng 10/2026)',
      periodNumber: 5,
      year: 2026,
      totalStudents: 32,
      attendanceRate: 98.2,
      lateCount: 2,
      absentCount: 1,
      praisesCount: 6,
      violationsCount: 1,
      summaryHighlights: [
        'Toàn thể lớp duy trì nề nếp tốt, 100% học sinh mặc đồng phục đúng quy định.',
        'Học sinh Trần Minh Quân và Phạm Thuỳ Linh có thành tích biểu dương trước cờ.',
        'Vệ sinh lớp học xếp loại Tốt trong bảng xếp hạng toàn trường.',
      ],
      recommendations: [
        'Nhắc nhở học sinh Lê Hoàng Nam chấn chỉnh việc đi học muộn.',
        'Tiếp tục đôn đốc học sinh nộp bài tập ôn tập Toán và ảnh thẻ hồ sơ.',
      ],
      absentStudents: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 1,
          dates: ['2026-10-02'],
          notes: ['Nghỉ ốm có phép'],
        },
      ],
      lateStudents: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 1,
          dates: ['2026-10-07'],
          notes: ['Đi muộn 10 phút'],
        },
        {
          studentId: 'std-05',
          studentName: 'Đỗ Tuấn Kiệt',
          count: 1,
          dates: ['2026-10-05'],
          notes: ['Đi muộn 5 phút do hỏng xe'],
        },
      ],
      topPraised: [
        {
          studentId: 'std-04',
          studentName: 'Phạm Thuỳ Linh',
          count: 2,
          points: 15,
          reasons: ['Đạt giải Nhất thi tìm hiểu truyền thống', 'Gương mẫu trong giờ sinh hoạt'],
        },
        {
          studentId: 'std-01',
          studentName: 'Trần Minh Quân',
          count: 2,
          points: 10,
          reasons: ['Hỗ trợ nhóm ôn tập môn Toán', 'Quản lý lớp giờ tự quản xuất sắc'],
        },
        {
          studentId: 'std-02',
          studentName: 'Nguyễn Thị Mai Anh',
          count: 1,
          points: 5,
          reasons: ['Hỗ trợ giải bài tập tiếng Anh'],
        },
      ],
      topViolations: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 1,
          points: -2,
          reasons: ['Đi học muộn và quên đồng phục ngày 07/10'],
        },
        {
          studentId: 'std-05',
          studentName: 'Đỗ Tuấn Kiệt',
          count: 1,
          points: -2,
          reasons: ['Mất trật tự trong giờ tự quản sinh hoạt lớp'],
        },
      ],
      overdueTasksCount: 1,
      overdueTasks: [
        {
          id: 'tsk-04',
          title: 'Nộp biên nhận học phí và bảo hiểm y tế kỳ 1',
          dueDate: '2026-10-01',
          requireReply: true,
          repliesCount: 2,
          isOverdue: true,
        },
      ],
      repliedParentsCount: 6,
      totalRepliesCount: 8,
      totalTasksCount: 4,
      createdAt: '2026-10-06T17:00:00Z',
    },
    {
      id: 'rep-02',
      classId: 'cls-12a1',
      type: 'monthly',
      periodLabel: 'Tháng 09/2026',
      periodNumber: 9,
      year: 2026,
      totalStudents: 32,
      attendanceRate: 97.8,
      lateCount: 5,
      absentCount: 3,
      praisesCount: 18,
      violationsCount: 4,
      summaryHighlights: [
        'Lớp 12A1 đạt giải Nhì phong trào thi đua chào mừng năm học mới.',
        'Đã kiện toàn Ban cán sự lớp và Ban đại diện cha mẹ học sinh.',
        'Hoàn tất thu thập hồ sơ đầu năm và kiểm tra sức khỏe ban đầu.',
      ],
      recommendations: [
        'Tăng cường phụ đạo ngoài giờ cho nhóm 4 học sinh cần bổ sung kiến thức môn Toán & Tiếng Anh.',
        'Phối hợp phụ huynh theo dõi giờ tự học buổi tối.',
      ],
      absentStudents: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 2,
          dates: ['2026-09-12', '2026-09-24'],
          notes: ['Sốt virus', 'Có phép gia đình'],
        },
        {
          studentId: 'std-06',
          studentName: 'Võ Ngọc Bích',
          count: 1,
          dates: ['2026-09-19'],
          notes: ['Nghỉ có đơn phép'],
        },
      ],
      lateStudents: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 3,
          dates: ['2026-09-10', '2026-09-18', '2026-09-29'],
          notes: ['Đi muộn 5-10 phút'],
        },
        {
          studentId: 'std-05',
          studentName: 'Đỗ Tuấn Kiệt',
          count: 2,
          dates: ['2026-09-15', '2026-09-22'],
          notes: ['Đi muộn đầu giờ'],
        },
      ],
      topPraised: [
        {
          studentId: 'std-01',
          studentName: 'Trần Minh Quân',
          count: 5,
          points: 25,
          reasons: ['Tổ chức ôn tập hiệu quả', 'Gương mẫu đi đầu phong trào'],
        },
        {
          studentId: 'std-04',
          studentName: 'Phạm Thuỳ Linh',
          count: 4,
          points: 22,
          reasons: ['Tham gia đội tuyển trường', 'Điểm kiểm tra xuất sắc'],
        },
        {
          studentId: 'std-02',
          studentName: 'Nguyễn Thị Mai Anh',
          count: 3,
          points: 15,
          reasons: ['Hỗ trợ ban cán sự', 'Năng nổ hoạt động ngoại khoá'],
        },
      ],
      topViolations: [
        {
          studentId: 'std-03',
          studentName: 'Lê Hoàng Nam',
          count: 2,
          points: -4,
          reasons: ['Đi học muộn nhiều lần', 'Quên thẻ học sinh'],
        },
        {
          studentId: 'std-05',
          studentName: 'Đỗ Tuấn Kiệt',
          count: 1,
          points: -2,
          reasons: ['Mất trật tự trong giờ học'],
        },
        {
          studentId: 'std-06',
          studentName: 'Võ Ngọc Bích',
          count: 1,
          points: -1,
          reasons: ['Chưa nộp biên nhận kiểm quỹ đúng hẹn'],
        },
      ],
      overdueTasksCount: 1,
      overdueTasks: [
        {
          id: 'tsk-04',
          title: 'Nộp biên nhận học phí và bảo hiểm y tế kỳ 1',
          dueDate: '2026-10-01',
          requireReply: true,
          repliesCount: 2,
          isOverdue: true,
        },
      ],
      repliedParentsCount: 28,
      totalRepliesCount: 35,
      totalTasksCount: 4,
      weekComparison: [
        {
          weekNumber: 1,
          weekLabel: 'Tuần 1 (01/09 - 07/09)',
          attendanceRate: 98.8,
          absentCount: 0,
          lateCount: 1,
          praisesCount: 5,
          violationsCount: 0,
          repliesCount: 10,
          trend: 'up',
        },
        {
          weekNumber: 2,
          weekLabel: 'Tuần 2 (08/09 - 14/09)',
          attendanceRate: 97.5,
          absentCount: 1,
          lateCount: 2,
          praisesCount: 4,
          violationsCount: 2,
          repliesCount: 8,
          trend: 'down',
        },
        {
          weekNumber: 3,
          weekLabel: 'Tuần 3 (15/09 - 21/09)',
          attendanceRate: 98.2,
          absentCount: 1,
          lateCount: 1,
          praisesCount: 5,
          violationsCount: 1,
          repliesCount: 9,
          trend: 'up',
        },
        {
          weekNumber: 4,
          weekLabel: 'Tuần 4 (22/09 - 30/09)',
          attendanceRate: 96.9,
          absentCount: 1,
          lateCount: 1,
          praisesCount: 4,
          violationsCount: 1,
          repliesCount: 8,
          trend: 'down',
        },
      ],
      createdAt: '2026-10-01T16:00:00Z',
    },
  ],
};

class MockDataProvider implements DataProvider {
  constructor() {
    this.seedData();
  }

  public seedData(force = false): void {
    if (typeof window === 'undefined') return;
    const isCleared = localStorage.getItem(`${STORAGE_KEY_PREFIX}cleared`) === 'true';
    if (isCleared && !force) {
      return;
    }
    const existing = localStorage.getItem(`${STORAGE_KEY_PREFIX}classes`);
    if (!existing || force) {
      Object.entries(initialSeedData).forEach(([key, value]) => {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
      });
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}cleared`);
    }
  }

  public isClearedData(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}cleared`) === 'true';
  }

  public clearMockData(
    keepRealClass = true,
    realClassCustom?: Partial<ClassInfo>
  ): void {
    if (typeof window === 'undefined') return;
    const defaultRealClass: ClassInfo = {
      id: 'cls-real-1',
      classname: 'Lớp 12A1',
      name: 'Lớp 12A1',
      grade: 'Khối 12',
      schoolYear: '2026 - 2027',
      homeroomTeacher: 'Thầy Nguyễn Văn Xuyên',
      homeroomTeacherName: 'Thầy Nguyễn Văn Xuyên',
      note: 'Trung tâm GDNN - GDTX Thị xã Long Mỹ, Tỉnh Hậu Giang',
      room: 'Phòng học 12A1',
      totalStudents: 0,
      teacherPhone: '0918 345 678',
      teacherEmail: 'xuyennv.gdtxlongmy@haugiang.edu.vn',
      ...realClassCustom,
    };

    const emptyData: DatabaseSchema = {
      classes: keepRealClass ? [defaultRealClass] : [],
      students: [],
      parents: [],
      attendance: [],
      behaviors: [],
      announcements: [],
      tasks: [],
      taskReplies: [],
      threads: [],
      messages: [],
      documents: [],
      reports: [],
    };

    Object.entries(emptyData).forEach(([key, value]) => {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
    });
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cleared`, 'true');
  }

  private getCollection<T>(resource: string): T[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${resource}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private saveCollection<T>(resource: string, items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${resource}`, JSON.stringify(items));
  }

  async list<T = any>(resource: string, filter?: Record<string, any>): Promise<T[]> {
    let items = this.getCollection<T>(resource);
    if (filter) {
      items = items.filter((item: any) => {
        return Object.entries(filter).every(([key, val]) => item[key] === val);
      });
    }
    return Promise.resolve(items);
  }

  async get<T = any>(resource: string, id: string): Promise<T | null> {
    const items = this.getCollection<T>(resource);
    const found = items.find((item: any) => item.id === id);
    return Promise.resolve(found || null);
  }

  async add<T = any>(resource: string, item: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const items = this.getCollection<T>(resource);
    const newId = item.id || `${resource.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem = { ...item, id: newId } as T;
    items.unshift(newItem);
    this.saveCollection(resource, items);
    return Promise.resolve(newItem);
  }

  async bulkAdd<T = any>(resource: string, newItems: (Omit<T, 'id'> & { id?: string })[]): Promise<T[]> {
    const items = this.getCollection<T>(resource);
    const addedItems: T[] = [];
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const newId = item.id || `${resource.slice(0, 3)}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
      const newItem = { ...item, id: newId } as T;
      items.unshift(newItem);
      addedItems.push(newItem);
    }
    this.saveCollection(resource, items);
    return Promise.resolve(addedItems);
  }

  async update<T = any>(resource: string, id: string, patch: Partial<T>): Promise<T> {
    const items = this.getCollection<T>(resource);
    const index = items.findIndex((it: any) => it.id === id);
    if (index === -1) {
      throw new Error(`Item ${id} not found in ${resource}`);
    }
    const updated = { ...items[index], ...patch };
    items[index] = updated;
    this.saveCollection(resource, items);
    return Promise.resolve(updated);
  }

  async remove(resource: string, id: string): Promise<boolean> {
    const items = this.getCollection<any>(resource);
    const filtered = items.filter((it: any) => it.id !== id);
    this.saveCollection(resource, filtered);
    return Promise.resolve(filtered.length !== items.length);
  }

  // Specialized: markAttendance (Supports both {classId, date, items} object and positional arguments)
  async markAttendance(
    paramsOrClassId: {
      classId: string;
      date: string;
      items: {
        studentId: string;
        studentName?: string;
        status: any;
        note?: string;
      }[];
    } | string,
    secondDate?: string,
    thirdRecords?: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[]
  ): Promise<Attendance[]> {
    let classId = '';
    let date = '';
    let items: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[] = [];

    if (typeof paramsOrClassId === 'object' && paramsOrClassId !== null) {
      classId = paramsOrClassId.classId;
      date = paramsOrClassId.date;
      items = paramsOrClassId.items || [];
    } else {
      classId = paramsOrClassId;
      date = secondDate || '';
      items = thirdRecords || [];
    }

    const existing = this.getCollection<Attendance>('attendance');
    const nowIso = new Date().toISOString();

    const updatedList = existing.filter(
      (a) => !(a.classId === classId && a.date === date)
    );

    const newRecords: Attendance[] = items.map((r, idx) => {
      let normalizedStatus = r.status;
      if (typeof normalizedStatus === 'string') {
        const upper = normalizedStatus.toUpperCase();
        if (upper === 'PRESENT' || upper === 'ABSENT' || upper === 'LATE') {
          normalizedStatus = upper;
        }
      }

      return {
        id: `att-${date}-${r.studentId}-${idx}`,
        classId,
        studentId: r.studentId,
        studentName: r.studentName || 'Học sinh',
        date,
        status: normalizedStatus,
        note: r.note || '',
        updatedAt: nowIso,
      };
    });

    const result = [...newRecords, ...updatedList];
    this.saveCollection('attendance', result);
    return Promise.resolve(newRecords);
  }

  // Specialized: listAttendanceByStudent(studentId, range)
  async listAttendanceByStudent(
    studentId: string,
    range?: {
      from?: string;
      to?: string;
      month?: number;
      year?: number;
      week?: number;
    } | string
  ): Promise<Attendance[]> {
    const list = this.getCollection<Attendance>('attendance');
    let filtered = list.filter((a) => a.studentId === studentId);

    if (range) {
      if (typeof range === 'object') {
        if (range.from && range.to) {
          filtered = filtered.filter((a) => a.date >= range.from! && a.date <= range.to!);
        } else if (range.month) {
          const monthStr = String(range.month).padStart(2, '0');
          const yearStr = range.year ? String(range.year) : '2026';
          filtered = filtered.filter((a) => a.date.startsWith(`${yearStr}-${monthStr}`));
        }
      } else if (typeof range === 'string') {
        filtered = filtered.filter((a) => a.date.startsWith(range));
      }
    }

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return Promise.resolve(filtered);
  }

  // Specialized: addBehavior
  async addBehavior(
    data: Omit<Behavior, 'id' | 'createdAt'>
  ): Promise<Behavior> {
    const newItem: Behavior = {
      ...data,
      id: `beh-${Date.now()}`,
      content: data.content || data.description || data.title || '',
      createdAt: new Date().toISOString(),
    };
    const items = this.getCollection<Behavior>('behaviors');
    items.unshift(newItem);
    this.saveCollection('behaviors', items);
    return Promise.resolve(newItem);
  }

  // Specialized: updateBehavior
  async updateBehavior(
    id: string,
    patch: Partial<Behavior>
  ): Promise<Behavior> {
    return this.update<Behavior>('behaviors', id, patch);
  }

  // Specialized: removeBehavior
  async removeBehavior(
    id: string
  ): Promise<boolean> {
    return this.remove('behaviors', id);
  }

  // Specialized: listBehaviorsByStudent
  async listBehaviorsByStudent(
    studentId: string
  ): Promise<Behavior[]> {
    const list = this.getCollection<Behavior>('behaviors');
    const filtered = list.filter((b) => b.studentId === studentId);
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return Promise.resolve(filtered);
  }

  // Specialized: getBehaviorStats
  async getBehaviorStats(
    classId?: string
  ): Promise<import('../core/types').BehaviorStats> {
    const list = this.getCollection<Behavior>('behaviors');
    const filtered = classId ? list.filter((b) => !b.classId || b.classId === classId) : list;

    let totalPraisePoints = 0;
    let warnCountWeek = 0;
    let warnCountMonth = 0;
    let totalPraises = 0;
    let totalWarnings = 0;

    filtered.forEach((b) => {
      const typeStr = String(b.type).toUpperCase();
      const isPraise = typeStr === 'PRAISE';
      const isWarn = typeStr === 'WARN' || typeStr === 'WARNING' || typeStr === 'VIOLATION';

      if (isPraise) {
        totalPraises++;
        totalPraisePoints += (Number(b.points) || 0);
      }
      if (isWarn) {
        totalWarnings++;
        if (b.date >= '2026-10-05') {
          warnCountWeek++;
        }
        if (b.date.startsWith('2026-10')) {
          warnCountMonth++;
        }
      }
    });

    return Promise.resolve({
      totalPraisePoints,
      warnCountWeek,
      warnCountMonth,
      totalPraises,
      totalWarnings,
    });
  }

  // Specialized: sendMessage (supports payload object or legacy argument list)
  async sendMessage(
    threadId: string,
    messagePayload:
      | {
          fromRole?: 'TEACHER' | 'PARENT' | 'STUDENT' | string;
          content: string;
          senderId?: string;
          senderName?: string;
          role?: 'teacher' | 'parent' | 'student';
          attachments?: string[];
        }
      | string,
    argSenderName?: string,
    argRole?: 'teacher' | 'parent' | 'student',
    argContent?: string,
    argAttachments: string[] = []
  ): Promise<Message> {
    const isObj = typeof messagePayload === 'object' && messagePayload !== null;

    let content = '';
    let fromRole: 'TEACHER' | 'PARENT' | 'STUDENT' | string = 'TEACHER';
    let senderId = '';
    let senderName = '';
    let attachments: string[] = [];

    if (isObj) {
      content = messagePayload.content || '';
      fromRole = (messagePayload.fromRole || (messagePayload.role ? messagePayload.role.toUpperCase() : 'TEACHER')) as any;
      senderId = messagePayload.senderId || (fromRole === 'TEACHER' ? 'teacher-xuyen' : 'sender-' + Date.now());
      senderName = messagePayload.senderName || (fromRole === 'TEACHER' ? 'Thầy Nguyễn Văn Xuyên' : 'Người gửi');
      attachments = messagePayload.attachments || [];
    } else {
      senderId = messagePayload as string;
      senderName = argSenderName || 'Thầy Nguyễn Văn Xuyên';
      const roleStr = argRole || 'teacher';
      fromRole = roleStr.toUpperCase();
      content = argContent || '';
      attachments = argAttachments || [];
    }

    const nowIso = new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      threadId,
      fromRole: fromRole.toUpperCase(),
      content,
      createdAt: nowIso,
      senderId,
      senderName,
      senderRole: fromRole.toLowerCase(),
      attachments,
    };

    const messages = this.getCollection<Message>('messages');
    messages.push(msg);
    this.saveCollection('messages', messages);

    // Update thread lastMessage & lastMessageAt
    const threads = this.getCollection<Thread>('threads');
    const thrIndex = threads.findIndex((t) => t.id === threadId);
    if (thrIndex !== -1) {
      threads[thrIndex].lastMessage = content;
      threads[thrIndex].lastMessageTime = nowIso;
      threads[thrIndex].lastMessageAt = nowIso;
      this.saveCollection('threads', threads);
    }

    return Promise.resolve(msg);
  }

  // Specialized: listMessages for a specific thread
  async listMessages(threadId: string): Promise<Message[]> {
    const messages = this.getCollection<Message>('messages');
    return Promise.resolve(
      messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  }

  // Specialized: listThreads with optional filter
  async listThreads(filter?: { classId?: string; threadKey?: string }): Promise<Thread[]> {
    let threads = this.getCollection<Thread>('threads');
    if (filter?.classId) {
      threads = threads.filter((t) => t.classId === filter.classId || t.threadKey === filter.classId);
    }
    if (filter?.threadKey) {
      threads = threads.filter((t) => t.threadKey === filter.threadKey);
    }
    return Promise.resolve(
      threads.sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageAt || b.lastMessageTime || 0).getTime();
        return timeB - timeA;
      })
    );
  }

  // Specialized: getOrCreateThread
  async getOrCreateThread(threadKey: string, payload?: Partial<Thread>): Promise<Thread> {
    const threads = this.getCollection<Thread>('threads');
    let thr = threads.find((t) => t.threadKey === threadKey || t.id === threadKey);
    if (!thr) {
      const nowIso = new Date().toISOString();
      thr = {
        id: `thr-${Date.now()}`,
        threadKey,
        participantsJson: payload?.participantsJson || JSON.stringify([{ role: 'TEACHER', name: 'Thầy Xuyên' }]),
        lastMessageAt: nowIso,
        lastMessage: 'Cuộc trò chuyện mới',
        lastMessageTime: nowIso,
        unreadCount: 0,
        ...payload,
      };
      threads.push(thr);
      this.saveCollection('threads', threads);
    }
    return Promise.resolve(thr);
  }

  // Specialized: replyTask (supports payload object or arguments)
  async replyTask(
    taskId: string,
    payload:
      | {
          studentId: string;
          parentId?: string;
          replyText: string;
          attachmentsJson?: string;
          studentName?: string;
          content?: string;
          fileUrl?: string;
          fileName?: string;
        }
      | string,
    argStudentName?: string,
    argContent?: string,
    argFileUrl?: string,
    argFileName?: string
  ): Promise<TaskReply> {
    const isObj = typeof payload === 'object' && payload !== null;
    const studentId = isObj ? payload.studentId : (payload as string);
    const parentId = isObj ? payload.parentId : undefined;
    const replyText = isObj
      ? (payload.replyText || payload.content || '')
      : (argContent || '');
    const attachmentsJson = isObj
      ? payload.attachmentsJson
      : (argFileUrl ? JSON.stringify([argFileUrl]) : undefined);
    const studentName = isObj
      ? (payload.studentName || '')
      : (argStudentName || '');
    const fileUrl = isObj ? payload.fileUrl : argFileUrl;
    const fileName = isObj ? payload.fileName : argFileName;
    const nowIso = new Date().toISOString();

    const reply: TaskReply = {
      id: `rpl-${Date.now()}`,
      taskId,
      studentId,
      parentId,
      replyText,
      attachmentsJson,
      createdAt: nowIso,
      studentName: studentName || this.getCollection<Student>('students').find((s) => s.id === studentId)?.fullname || 'Học sinh',
      content: replyText,
      fileUrl,
      fileName,
      submittedAt: nowIso,
    };

    const replies = this.getCollection<TaskReply>('taskReplies');
    replies.unshift(reply);
    this.saveCollection('taskReplies', replies);

    // Increment task repliesCount and ensure state persistence
    const tasks = this.getCollection<Task>('tasks');
    const taskIdx = tasks.findIndex((t) => t.id === taskId);
    if (taskIdx !== -1) {
      tasks[taskIdx].repliesCount = (tasks[taskIdx].repliesCount || 0) + 1;
      this.saveCollection('tasks', tasks);
    }

    return Promise.resolve(reply);
  }

  // Specialized: listTasksByClass
  async listTasksByClass(classId: string): Promise<Task[]> {
    const tasks = this.getCollection<Task>('tasks');
    const filtered = tasks.filter((t) => !t.classId || t.classId === classId);
    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(filtered);
  }

  // Specialized: getTaskReplies
  async getTaskReplies(taskId: string): Promise<TaskReply[]> {
    const replies = this.getCollection<TaskReply>('taskReplies');
    const filtered = replies.filter((r) => r.taskId === taskId);
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(filtered);
  }

  // Specialized: reportsWeekly
  async reportsWeekly(
    classId: string,
    weekRange?: number | string | { from?: string; to?: string; week?: number },
    yearArg?: number
  ): Promise<Report> {
    const year = yearArg || 2026;
    let weekNum = 5;
    let weekLabel = 'Tuần 05 (Tháng 10/2026)';

    if (typeof weekRange === 'number') {
      weekNum = weekRange;
      weekLabel = `Tuần ${weekNum < 10 ? '0' + weekNum : weekNum} (Năm học ${year})`;
    } else if (typeof weekRange === 'string') {
      const parsed = parseInt(weekRange, 10);
      if (!isNaN(parsed)) {
        weekNum = parsed;
        weekLabel = `Tuần ${weekNum < 10 ? '0' + weekNum : weekNum} (Năm học ${year})`;
      } else {
        weekLabel = weekRange;
      }
    } else if (typeof weekRange === 'object' && weekRange !== null) {
      if (weekRange.week) {
        weekNum = weekRange.week;
      }
      if (weekRange.from && weekRange.to) {
        weekLabel = `Tuần ${weekNum} (${weekRange.from} - ${weekRange.to})`;
      } else {
        weekLabel = `Tuần ${weekNum} (Năm học ${year})`;
      }
    }

    const students = this.getCollection<Student>('students').filter(
      (s) => !classId || s.classId === classId
    );
    const totalStudents = students.length || 32;
    const studentMap = new Map<string, string>();
    students.forEach((s) => {
      studentMap.set(s.id, s.fullname || s.name || 'Học sinh');
    });

    const attendanceList = this.getCollection<Attendance>('attendance').filter(
      (a) => !classId || a.classId === classId
    );
    const behaviorList = this.getCollection<Behavior>('behaviors').filter(
      (b) => !classId || b.classId === classId
    );
    const taskList = this.getCollection<Task>('tasks').filter(
      (t) => !classId || t.classId === classId
    );
    const replyList = this.getCollection<TaskReply>('taskReplies');

    // Attendance metrics
    const absentRecords = attendanceList.filter((a) => a.status === 'ABSENT' || (a.status as any) === 'absent');
    const lateRecords = attendanceList.filter((a) => a.status === 'LATE' || (a.status as any) === 'late');
    const presentRecords = attendanceList.filter((a) => a.status === 'PRESENT' || (a.status as any) === 'present');

    // Group absent students
    const absentMap = new Map<string, { count: number; dates: string[]; notes: string[] }>();
    absentRecords.forEach((rec) => {
      const cur = absentMap.get(rec.studentId) || { count: 0, dates: [], notes: [] };
      cur.count += 1;
      if (rec.date && !cur.dates.includes(rec.date)) cur.dates.push(rec.date);
      if (rec.note && !cur.notes.includes(rec.note)) cur.notes.push(rec.note);
      absentMap.set(rec.studentId, cur);
    });

    const absentStudents: ReportStudentStat[] = Array.from(absentMap.entries()).map(([stdId, info]) => ({
      studentId: stdId,
      studentName: studentMap.get(stdId) || 'Học sinh',
      count: info.count,
      dates: info.dates,
      notes: info.notes,
    }));

    // Group late students
    const lateMap = new Map<string, { count: number; dates: string[]; notes: string[] }>();
    lateRecords.forEach((rec) => {
      const cur = lateMap.get(rec.studentId) || { count: 0, dates: [], notes: [] };
      cur.count += 1;
      if (rec.date && !cur.dates.includes(rec.date)) cur.dates.push(rec.date);
      if (rec.note && !cur.notes.includes(rec.note)) cur.notes.push(rec.note);
      lateMap.set(rec.studentId, cur);
    });

    const lateStudents: ReportStudentStat[] = Array.from(lateMap.entries()).map(([stdId, info]) => ({
      studentId: stdId,
      studentName: studentMap.get(stdId) || 'Học sinh',
      count: info.count,
      dates: info.dates,
      notes: info.notes,
    }));

    // Attendance rate calculation
    let attendanceRate = 98.2;
    if (attendanceList.length > 0) {
      const weightedPresents = presentRecords.length + lateRecords.length * 0.7;
      attendanceRate = Math.min(100, Math.max(85, Math.round((weightedPresents / attendanceList.length) * 100 * 10) / 10));
    }

    // Behavior: Top praises
    const praiseRecords = behaviorList.filter(
      (b) => b.type === 'PRAISE' || (b.type as any) === 'praise'
    );
    const praiseMap = new Map<string, { count: number; points: number; reasons: string[] }>();
    praiseRecords.forEach((rec) => {
      const cur = praiseMap.get(rec.studentId) || { count: 0, points: 0, reasons: [] };
      cur.count += 1;
      cur.points += rec.points || 5;
      const desc = rec.content || rec.title || 'Khen ngợi thi đua';
      if (!cur.reasons.includes(desc)) cur.reasons.push(desc);
      praiseMap.set(rec.studentId, cur);
    });

    const topPraised: ReportStudentStat[] = Array.from(praiseMap.entries())
      .map(([stdId, info]) => ({
        studentId: stdId,
        studentName: studentMap.get(stdId) || 'Học sinh',
        count: info.count,
        points: info.points,
        reasons: info.reasons,
      }))
      .sort((a, b) => (b.points || 0) - (a.points || 0));

    // Behavior: Top violations / warnings
    const warnRecords = behaviorList.filter(
      (b) =>
        b.type === 'WARN' ||
        (b.type as any) === 'warn' ||
        (b.type as any) === 'violation' ||
        (b.type as any) === 'warning'
    );
    const warnMap = new Map<string, { count: number; points: number; reasons: string[] }>();
    warnRecords.forEach((rec) => {
      const cur = warnMap.get(rec.studentId) || { count: 0, points: 0, reasons: [] };
      cur.count += 1;
      cur.points += rec.points || -2;
      const desc = rec.content || rec.title || 'Nhắc nhở nề nếp';
      if (!cur.reasons.includes(desc)) cur.reasons.push(desc);
      warnMap.set(rec.studentId, cur);
    });

    const topViolations: ReportStudentStat[] = Array.from(warnMap.entries())
      .map(([stdId, info]) => ({
        studentId: stdId,
        studentName: studentMap.get(stdId) || 'Học sinh',
        count: info.count,
        points: info.points,
        reasons: info.reasons,
      }))
      .sort((a, b) => b.count - a.count);

    // Overdue tasks
    const nowTs = new Date().getTime();
    const taskRepliesByTaskId = new Map<string, TaskReply[]>();
    replyList.forEach((r) => {
      const cur = taskRepliesByTaskId.get(r.taskId) || [];
      cur.push(r);
      taskRepliesByTaskId.set(r.taskId, cur);
    });

    const overdueTasks: ReportTaskStat[] = [];
    taskList.forEach((t) => {
      const dueTs = new Date(t.dueDate).getTime();
      const isOverdue = dueTs < nowTs;
      const replies = taskRepliesByTaskId.get(t.id) || [];
      const repliesCount = t.repliesCount || replies.length;
      if (isOverdue) {
        overdueTasks.push({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          requireReply: !!t.requireReply,
          repliesCount,
          isOverdue: true,
        });
      }
    });

    // Parent/Student reply stats
    const classTaskIds = new Set(taskList.map((t) => t.id));
    const classReplies = replyList.filter((r) => classTaskIds.has(r.taskId));
    const repliedStudentIds = new Set(classReplies.map((r) => r.studentId));

    const rep: Report = {
      id: `rep-w-${weekNum}-${year}`,
      classId,
      type: 'weekly',
      periodLabel: weekLabel,
      periodNumber: weekNum,
      year,
      totalStudents,
      attendanceRate,
      lateCount: lateRecords.length,
      absentCount: absentRecords.length,
      praisesCount: praiseRecords.length,
      violationsCount: warnRecords.length,
      absentStudents: absentStudents.length > 0 ? absentStudents : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 1, dates: ['2026-10-02'], notes: ['Nghỉ ốm có phép'] }
      ],
      lateStudents: lateStudents.length > 0 ? lateStudents : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 1, dates: ['2026-10-07'], notes: ['Đi muộn 10 phút'] }
      ],
      topPraised: topPraised.length > 0 ? topPraised : [
        { studentId: 'std-04', studentName: 'Phạm Thuỳ Linh', count: 2, points: 15, reasons: ['Đạt giải Nhất thi tìm hiểu truyền thống'] },
        { studentId: 'std-01', studentName: 'Trần Minh Quân', count: 2, points: 10, reasons: ['Hỗ trợ nhóm ôn tập môn Toán'] }
      ],
      topViolations: topViolations.length > 0 ? topViolations : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 1, points: -2, reasons: ['Đi học muộn và quên đồng phục'] }
      ],
      overdueTasksCount: overdueTasks.length,
      overdueTasks: overdueTasks.length > 0 ? overdueTasks : [
        { id: 'tsk-04', title: 'Nộp biên nhận học phí và bảo hiểm y tế kỳ 1', dueDate: '2026-10-01', requireReply: true, repliesCount: 2, isOverdue: true }
      ],
      repliedParentsCount: repliedStudentIds.size || 6,
      totalRepliesCount: classReplies.length || 8,
      totalTasksCount: taskList.length,
      summaryHighlights: [
        `Tỉ lệ chuyên cần tuần đạt ${attendanceRate}%, sĩ số lớp duy trì ổn định.`,
        `Ghi nhận ${praiseRecords.length} lượt khen thưởng học sinh tích cực trong học tập và phong trào.`,
        `Có ${repliedStudentIds.size || 6} phụ huynh và học sinh đã hoàn thành phản hồi bài tập/nhắc việc.`,
      ],
      recommendations: [
        overdueTasks.length > 0
          ? `Đôn đốc các học sinh còn nợ bài tập quá hạn (${overdueTasks.map((t) => t.title).slice(0, 1).join(', ')}) nộp bổ sung gấp.`
          : 'Duy trì tiến độ hoàn thành bài tập đúng hạn.',
        lateStudents.length > 0
          ? `Trao đổi riêng với gia đình học sinh ${lateStudents.map((s) => s.studentName).slice(0, 2).join(', ')} để khắc phục việc đi học muộn.`
          : 'Khen ngợi ý thức nề nếp kỷ luật toàn lớp.',
      ],
      createdAt: new Date().toISOString(),
    };

    const reports = this.getCollection<Report>('reports');
    const existingIdx = reports.findIndex((r) => r.id === rep.id);
    if (existingIdx !== -1) {
      reports[existingIdx] = rep;
    } else {
      reports.unshift(rep);
    }
    this.saveCollection('reports', reports);
    return Promise.resolve(rep);
  }

  // Specialized: reportsMonthly
  async reportsMonthly(
    classId: string,
    monthArg?: number | string,
    yearArg?: number
  ): Promise<Report> {
    const year = yearArg || 2026;
    let monthNum = 10;
    if (typeof monthArg === 'number') {
      monthNum = monthArg;
    } else if (typeof monthArg === 'string') {
      const parsed = parseInt(monthArg, 10);
      monthNum = !isNaN(parsed) ? parsed : 10;
    }

    const students = this.getCollection<Student>('students').filter(
      (s) => !classId || s.classId === classId
    );
    const totalStudents = students.length || 32;
    const studentMap = new Map<string, string>();
    students.forEach((s) => {
      studentMap.set(s.id, s.fullname || s.name || 'Học sinh');
    });

    const attendanceList = this.getCollection<Attendance>('attendance').filter(
      (a) => !classId || a.classId === classId
    );
    const behaviorList = this.getCollection<Behavior>('behaviors').filter(
      (b) => !classId || b.classId === classId
    );
    const taskList = this.getCollection<Task>('tasks').filter(
      (t) => !classId || t.classId === classId
    );
    const replyList = this.getCollection<TaskReply>('taskReplies');

    const absentRecords = attendanceList.filter((a) => a.status === 'ABSENT' || (a.status as any) === 'absent');
    const lateRecords = attendanceList.filter((a) => a.status === 'LATE' || (a.status as any) === 'late');
    const praiseRecords = behaviorList.filter((b) => b.type === 'PRAISE' || (b.type as any) === 'praise');
    const warnRecords = behaviorList.filter(
      (b) => b.type === 'WARN' || (b.type as any) === 'violation' || (b.type as any) === 'warning'
    );

    // Group absent students
    const absentMap = new Map<string, { count: number; dates: string[]; notes: string[] }>();
    absentRecords.forEach((rec) => {
      const cur = absentMap.get(rec.studentId) || { count: 0, dates: [], notes: [] };
      cur.count += 1;
      if (rec.date && !cur.dates.includes(rec.date)) cur.dates.push(rec.date);
      if (rec.note && !cur.notes.includes(rec.note)) cur.notes.push(rec.note);
      absentMap.set(rec.studentId, cur);
    });
    const absentStudents = Array.from(absentMap.entries()).map(([stdId, info]) => ({
      studentId: stdId,
      studentName: studentMap.get(stdId) || 'Học sinh',
      count: info.count,
      dates: info.dates,
      notes: info.notes,
    }));

    // Group late students
    const lateMap = new Map<string, { count: number; dates: string[]; notes: string[] }>();
    lateRecords.forEach((rec) => {
      const cur = lateMap.get(rec.studentId) || { count: 0, dates: [], notes: [] };
      cur.count += 1;
      if (rec.date && !cur.dates.includes(rec.date)) cur.dates.push(rec.date);
      if (rec.note && !cur.notes.includes(rec.note)) cur.notes.push(rec.note);
      lateMap.set(rec.studentId, cur);
    });
    const lateStudents = Array.from(lateMap.entries()).map(([stdId, info]) => ({
      studentId: stdId,
      studentName: studentMap.get(stdId) || 'Học sinh',
      count: info.count,
      dates: info.dates,
      notes: info.notes,
    }));

    // Group praises
    const praiseMap = new Map<string, { count: number; points: number; reasons: string[] }>();
    praiseRecords.forEach((rec) => {
      const cur = praiseMap.get(rec.studentId) || { count: 0, points: 0, reasons: [] };
      cur.count += 1;
      cur.points += rec.points || 5;
      const desc = rec.content || rec.title || 'Biểu dương thi đua';
      if (!cur.reasons.includes(desc)) cur.reasons.push(desc);
      praiseMap.set(rec.studentId, cur);
    });
    const topPraised = Array.from(praiseMap.entries())
      .map(([stdId, info]) => ({
        studentId: stdId,
        studentName: studentMap.get(stdId) || 'Học sinh',
        count: info.count,
        points: info.points,
        reasons: info.reasons,
      }))
      .sort((a, b) => (b.points || 0) - (a.points || 0));

    // Group violations
    const warnMap = new Map<string, { count: number; points: number; reasons: string[] }>();
    warnRecords.forEach((rec) => {
      const cur = warnMap.get(rec.studentId) || { count: 0, points: 0, reasons: [] };
      cur.count += 1;
      cur.points += rec.points || -2;
      const desc = rec.content || rec.title || 'Nhắc nhở';
      if (!cur.reasons.includes(desc)) cur.reasons.push(desc);
      warnMap.set(rec.studentId, cur);
    });
    const topViolations = Array.from(warnMap.entries())
      .map(([stdId, info]) => ({
        studentId: stdId,
        studentName: studentMap.get(stdId) || 'Học sinh',
        count: info.count,
        points: info.points,
        reasons: info.reasons,
      }))
      .sort((a, b) => b.count - a.count);

    // Overdue tasks
    const nowTs = new Date().getTime();
    const overdueTasks: ReportTaskStat[] = [];
    taskList.forEach((t) => {
      const dueTs = new Date(t.dueDate).getTime();
      const isOverdue = dueTs < nowTs;
      if (isOverdue) {
        overdueTasks.push({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          requireReply: !!t.requireReply,
          repliesCount: t.repliesCount || 0,
          isOverdue: true,
        });
      }
    });

    const classTaskIds = new Set(taskList.map((t) => t.id));
    const classReplies = replyList.filter((r) => classTaskIds.has(r.taskId));
    const repliedStudentIds = new Set(classReplies.map((r) => r.studentId));

    // Monthly week-by-week comparison table
    const weekComparison: WeekComparisonItem[] = [
      {
        weekNumber: 1,
        weekLabel: `Tuần 1 (01/${monthNum < 10 ? '0' + monthNum : monthNum} - 07/${monthNum < 10 ? '0' + monthNum : monthNum})`,
        attendanceRate: 98.8,
        absentCount: 0,
        lateCount: 1,
        praisesCount: 6,
        violationsCount: 1,
        repliesCount: 8,
        trend: 'up',
      },
      {
        weekNumber: 2,
        weekLabel: `Tuần 2 (08/${monthNum < 10 ? '0' + monthNum : monthNum} - 14/${monthNum < 10 ? '0' + monthNum : monthNum})`,
        attendanceRate: 97.4,
        absentCount: 1,
        lateCount: 2,
        praisesCount: 5,
        violationsCount: 2,
        repliesCount: 7,
        trend: 'down',
      },
      {
        weekNumber: 3,
        weekLabel: `Tuần 3 (15/${monthNum < 10 ? '0' + monthNum : monthNum} - 21/${monthNum < 10 ? '0' + monthNum : monthNum})`,
        attendanceRate: 98.5,
        absentCount: 1,
        lateCount: 1,
        praisesCount: 7,
        violationsCount: 1,
        repliesCount: 10,
        trend: 'up',
      },
      {
        weekNumber: 4,
        weekLabel: `Tuần 4 (22/${monthNum < 10 ? '0' + monthNum : monthNum} - 30/${monthNum < 10 ? '0' + monthNum : monthNum})`,
        attendanceRate: 97.9,
        absentCount: 1,
        lateCount: 1,
        praisesCount: 5,
        violationsCount: 1,
        repliesCount: 9,
        trend: 'down',
      },
    ];

    const rep: Report = {
      id: `rep-m-${monthNum}-${year}`,
      classId,
      type: 'monthly',
      periodLabel: `Báo cáo Tổng kết Tháng ${monthNum < 10 ? '0' + monthNum : monthNum}/${year}`,
      periodNumber: monthNum,
      year,
      totalStudents,
      attendanceRate: 98.1,
      lateCount: lateRecords.length || 5,
      absentCount: absentRecords.length || 3,
      praisesCount: praiseRecords.length || 23,
      violationsCount: warnRecords.length || 5,
      absentStudents: absentStudents.length > 0 ? absentStudents : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 2, dates: ['2026-09-12', '2026-09-24'], notes: ['Nghỉ ốm', 'Có phép'] }
      ],
      lateStudents: lateStudents.length > 0 ? lateStudents : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 3, dates: ['2026-09-10', '2026-09-18'], notes: ['Đi muộn'] },
        { studentId: 'std-05', studentName: 'Đỗ Tuấn Kiệt', count: 2, dates: ['2026-09-15'], notes: ['Đi muộn'] }
      ],
      topPraised: topPraised.length > 0 ? topPraised : [
        { studentId: 'std-01', studentName: 'Trần Minh Quân', count: 5, points: 25, reasons: ['Tổ chức ôn tập hiệu quả', 'Gương mẫu đi đầu phong trào'] },
        { studentId: 'std-04', studentName: 'Phạm Thuỳ Linh', count: 4, points: 22, reasons: ['Đạt giải Nhất thi văn cảm nghĩ'] }
      ],
      topViolations: topViolations.length > 0 ? topViolations : [
        { studentId: 'std-03', studentName: 'Lê Hoàng Nam', count: 2, points: -4, reasons: ['Đi học muộn nhiều lần'] }
      ],
      overdueTasksCount: overdueTasks.length,
      overdueTasks: overdueTasks.length > 0 ? overdueTasks : [
        { id: 'tsk-04', title: 'Nộp biên nhận học phí và bảo hiểm y tế kỳ 1', dueDate: '2026-10-01', requireReply: true, repliesCount: 2, isOverdue: true }
      ],
      repliedParentsCount: repliedStudentIds.size || 28,
      totalRepliesCount: classReplies.length || 34,
      totalTasksCount: taskList.length,
      weekComparison,
      summaryHighlights: [
        `Tỉ lệ chuyên cần trung bình tháng đạt 98.1%, duy trì ổn định qua cả 4 tuần học.`,
        `Ghi nhận tổng cộng ${praiseRecords.length || 23} lượt khen thưởng thi đua, phong trào học tập diễn ra sôi nổi.`,
        `Kênh trao đổi liên lạc với phụ huynh đạt tỉ lệ tương tác ${repliedStudentIds.size || 28}/${totalStudents} gia đình.`,
      ],
      recommendations: [
        'Chuẩn bị chu đáo nội dung họp phụ huynh và sơ kết kỳ thi giữa học kỳ 1.',
        'Theo dõi sát sao nề nếp của nhóm học sinh có lượt đi muộn trong tuần 2 và tuần 4.',
        'Tiếp tục triển khai tính năng nộp bài trực tuyến và liên lạc qua cổng thông tin.',
      ],
      createdAt: new Date().toISOString(),
    };

    const reports = this.getCollection<Report>('reports');
    const existingIdx = reports.findIndex((r) => r.id === rep.id);
    if (existingIdx !== -1) {
      reports[existingIdx] = rep;
    } else {
      reports.unshift(rep);
    }
    this.saveCollection('reports', reports);
    return Promise.resolve(rep);
  }

  // Specialized: listAnnouncementsByClass
  async listAnnouncementsByClass(classId: string): Promise<Announcement[]> {
    const list = this.getCollection<Announcement>('announcements');
    const filtered = classId ? list.filter((a) => !a.classId || a.classId === classId) : list;
    // Sort pinned first (true first), then by createdAt descending
    filtered.sort((a, b) => {
      const aPinned = !!(a.pinned ?? a.isPinned);
      const bPinned = !!(b.pinned ?? b.isPinned);
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    return Promise.resolve(filtered);
  }

  // Specialized: togglePinAnnouncement
  async togglePinAnnouncement(id: string): Promise<Announcement> {
    const list = this.getCollection<Announcement>('announcements');
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Announcement ${id} not found`);
    }
    const current = list[index];
    const newPinned = !(current.pinned ?? current.isPinned);
    const updated: Announcement = {
      ...current,
      pinned: newPinned,
      isPinned: newPinned,
    };
    list[index] = updated;
    this.saveCollection('announcements', list);
    return Promise.resolve(updated);
  }

  // Specialized: listDocumentsByClass
  async listDocumentsByClass(classId: string, category?: string): Promise<Document[]> {
    const list = this.getCollection<Document>('documents');
    let filtered = classId ? list.filter((d) => !d.classId || d.classId === classId) : list;
    if (category && category !== 'all') {
      filtered = filtered.filter((d) => d.category === category);
    }
    filtered.sort((a, b) => (b.createdAt || b.uploadedAt || '').localeCompare(a.createdAt || a.uploadedAt || ''));
    return Promise.resolve(filtered);
  }
}

export const mockProvider = new MockDataProvider();
export const defaultProvider = mockProvider;
