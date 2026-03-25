import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User, Batch, AttendanceRecord, Test, FeePayment, Notice, ChatMessage, Material,
} from '@/types';

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUser(phone: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', phone));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => d.data() as User);
}

export async function getStudents(): Promise<User[]> {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as User);
}

export async function setUser(phone: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', phone), { phone, ...data }, { merge: true });
}

export async function deleteUser(phone: string): Promise<void> {
  await deleteDoc(doc(db, 'users', phone));
}

// ── Batches ──────────────────────────────────────────────────────────────────

export async function getBatches(): Promise<Batch[]> {
  const snap = await getDocs(collection(db, 'batches'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch));
}

export async function getBatch(id: string): Promise<Batch | null> {
  const snap = await getDoc(doc(db, 'batches', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Batch) : null;
}

export async function createBatch(data: Omit<Batch, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'batches'), data);
  return ref.id;
}

export async function updateBatch(id: string, data: Partial<Batch>): Promise<void> {
  await updateDoc(doc(db, 'batches', id), data);
}

export async function deleteBatch(id: string): Promise<void> {
  await deleteDoc(doc(db, 'batches', id));
}

// ── Attendance ───────────────────────────────────────────────────────────────

export async function getAttendance(batchId: string, date: string): Promise<AttendanceRecord | null> {
  const snap = await getDoc(doc(db, 'attendance', batchId, 'records', date));
  return snap.exists() ? (snap.data() as AttendanceRecord) : null;
}

export async function saveAttendance(batchId: string, date: string, record: AttendanceRecord): Promise<void> {
  await setDoc(doc(db, 'attendance', batchId, 'records', date), record);
}

export async function getStudentAttendance(batchId: string): Promise<AttendanceRecord[]> {
  const snap = await getDocs(collection(db, 'attendance', batchId, 'records'));
  return snap.docs.map(d => d.data() as AttendanceRecord);
}

// ── Marks ────────────────────────────────────────────────────────────────────

export async function getTests(batchId: string): Promise<Test[]> {
  const snap = await getDocs(
    query(collection(db, 'marks', batchId, 'tests'), orderBy('date', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Test));
}

export async function createTest(batchId: string, data: Omit<Test, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'marks', batchId, 'tests'), data);
  return ref.id;
}

export async function updateTest(batchId: string, testId: string, data: Partial<Test>): Promise<void> {
  await updateDoc(doc(db, 'marks', batchId, 'tests', testId), data);
}

// ── Fees ─────────────────────────────────────────────────────────────────────

export async function getFeePayments(phone: string): Promise<FeePayment[]> {
  const snap = await getDocs(
    query(collection(db, 'fees', phone, 'payments'), orderBy('dueDate', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeePayment));
}

export async function addFeePayment(phone: string, data: Omit<FeePayment, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'fees', phone, 'payments'), data);
  return ref.id;
}

export async function updateFeePayment(phone: string, paymentId: string, data: Partial<FeePayment>): Promise<void> {
  await updateDoc(doc(db, 'fees', phone, 'payments', paymentId), data);
}

// ── Notices ──────────────────────────────────────────────────────────────────

export async function getNotices(): Promise<Notice[]> {
  const snap = await getDocs(
    query(collection(db, 'notices'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
}

export function subscribeNotices(callback: (notices: Notice[]) => void) {
  return onSnapshot(
    query(collection(db, 'notices'), orderBy('createdAt', 'desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)))
  );
}

export async function createNotice(data: Omit<Notice, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'notices'), data);
  return ref.id;
}

export async function deleteNotice(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notices', id));
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export function subscribeMessages(phone: string, callback: (messages: ChatMessage[]) => void) {
  return onSnapshot(
    query(collection(db, 'chats', phone, 'messages'), orderBy('timestamp', 'asc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)))
  );
}

export async function sendMessage(phone: string, message: Omit<ChatMessage, 'id'>): Promise<void> {
  await addDoc(collection(db, 'chats', phone, 'messages'), message);
}

// ── Content ──────────────────────────────────────────────────────────────────

export async function getMaterials(batchId: string): Promise<Material[]> {
  const snap = await getDocs(
    query(collection(db, 'content', batchId, 'materials'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Material));
}

export async function addMaterial(batchId: string, data: Omit<Material, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'content', batchId, 'materials'), data);
  return ref.id;
}

export async function deleteMaterial(batchId: string, materialId: string): Promise<void> {
  await deleteDoc(doc(db, 'content', batchId, 'materials', materialId));
}
