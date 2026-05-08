import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  BookOpen, 
  User, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  ExternalLink,
  GraduationCap,
  X,
  FileText
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function CourseSystem() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    lecturer: '',
    progress: 0,
    syllabusUrl: ''
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'courses'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'courses'));

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'courses'), {
        ...formData,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({ title: '', semester: '', lecturer: '', progress: 0, syllabusUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'courses');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course? All associated notes will remain but lose their connection.')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      await updateDoc(doc(db, 'courses', id), {
        progress: newProgress,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `courses/${id}`);
    }
  };

  return (
    <div className="flex-1 ml-72 p-10 bg-zinc-50 font-sans min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-medium text-zinc-900 mb-2 tracking-tighter">Academic <span className="font-serif italic font-bold">Protocol</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Structured course management and curriculum monitoring.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 transition-all"
        >
          <Plus className="w-5 h-5" />
          Enroll Course
        </button>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <AnimatePresence>
          {courses.map((course, index) => (
            <motion.div
              layout
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="premium-card p-8 bg-white group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => handleDelete(course.id, e)}
                  className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-display font-bold text-zinc-900 mb-2 tracking-tight">{course.title}</h3>
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <User className="w-3.5 h-3.5" /> {course.lecturer || 'TBA'}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" /> {course.semester || 'Current Segment'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  <span>Absorption Rate</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="relative group/progress">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={course.progress}
                    onChange={(e) => handleProgressUpdate(course.id, parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-zinc-900 group-hover:bg-blue-500 transition-all" 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="absolute top-4 left-0 right-0 opacity-0 group-hover/progress:opacity-100 transition-opacity text-[8px] font-mono font-bold text-zinc-300 text-center uppercase tracking-widest">
                    Slide to adjust protocol absorption
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-center">
                 <button className="text-xs font-bold text-zinc-900 flex items-center gap-1 hover:gap-2 transition-all">
                   Open Archive <ChevronRight className="w-4 h-4" />
                 </button>
                 {course.syllabusUrl && (
                    <a href={course.syllabusUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-900 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                 )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {courses.length === 0 && (
          <div className="col-span-3 py-40 text-center">
             <GraduationCap className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-zinc-400">No courses protocol active</h3>
             <p className="text-sm text-zinc-300">Enroll your first subject to begin knowledge capture.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <header className="p-8 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Enrollment Protocol</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </header>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Subject Title</label>
                  <input 
                    required
                    className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                    placeholder="e.g. Behavioral Economics"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Semester</label>
                    <input 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                      placeholder="Fall 2026"
                      value={formData.semester}
                      onChange={e => setFormData({...formData, semester: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Lecturer</label>
                    <input 
                      className="w-full px-6 py-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                      placeholder="Dr. Smith"
                      value={formData.lecturer}
                      onChange={e => setFormData({...formData, lecturer: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Absorption Progress (%)</label>
                  <input 
                    type="range" min="0" max="100"
                    className="w-full accent-zinc-900"
                    value={formData.progress}
                    onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all">
                  Initialize Subject
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
