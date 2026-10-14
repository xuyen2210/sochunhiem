import { DataProvider } from './dataProvider';
import { firestoreProvider } from '../providers/firestoreProvider';
import { mockProvider } from '../providers/mockProvider';

// Provider mặc định kết nối Firestore với bộ đệm offline thông minh
export const defaultProvider: DataProvider = firestoreProvider;
export { firestoreProvider, mockProvider };

export default defaultProvider;
