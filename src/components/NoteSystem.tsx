import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  FileText, 
  Tag, 
  Sparkles, 
  Save, 
  Trash2, 
  Share2, 
  Clock,
  BookOpen,
  ArrowRight,
  Brain,
  Lightbulb,
  X,
  Eye,
  EyeOff,
  Search,
  ChevronRight
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { generateAIContent, generateAIJSON } from '../lib/gemini';
import { cn, formatDate } from '../lib/utils';
import Markdown from 'react-markdown';

export default function NoteSystem() {
  const [notes, setNotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('General');
  const [noteType, setNoteType] = useState('Rich Text');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'notes'));

    const qCourses = query(collection(db, 'courses'), where('userId', '==', user.uid));
    const unsubscribeCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'courses'));

    return () => {
      unsubscribe();
      unsubscribeCourses();
    };
  }, []);

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      const payload = {
        userId: user?.uid,
        topic,
        content,
        courseId,
        type: noteType,
        tags: currentTags,
        updatedAt: new Date().toISOString(),
      };

      if (activeNote) {
        await setDoc(doc(db, 'notes', activeNote.id), {
          ...payload,
          createdAt: activeNote.createdAt,
        });
      } else {
        const newDoc = await addDoc(collection(db, 'notes'), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        setActiveNote({ id: newDoc.id, ...payload, createdAt: new Date().toISOString() });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Permanently redact this knowledge instance?')) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
      if (activeNote?.id === id) {
        setActiveNote(null);
        setTopic('');
        setContent('');
        setCurrentTags([]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notes/${id}`);
    }
  };

  const handleGenerateAI = async () => {
    if (!content) return;
    setIsGenerating(true);
    try {
      const summaryPrompt = `Summarize these lecture notes into concise bullet points. Also, generate entrepreneurial "Business Insights" based on these concepts.\n\nNotes:\n${content}`;
      const aiResult = await generateAIContent(summaryPrompt, "You are FounderOS AI, a smart assistant for business students.");
      setContent(prev => prev + "\n\n--- AI INSIGHTS ---\n" + aiResult);
    } catch (err) {
      console.error("AI Gen error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!activeNote || !content) {
      alert("Select and save a note with content first.");
      return;
    }
    setIsGeneratingFlashcards(true);
    try {
      const flashcardsSchema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            front: { type: "STRING" },
            back: { type: "STRING" }
          },
          required: ["front", "back"]
        }
      };

      const prompt = `Generate 5-8 high-quality study flashcards based on these notes. Focus on important terms and business applications.\n\nNotes:\n${content}`;
      const flashcards = await generateAIJSON(prompt, flashcardsSchema, "You are FounderOS AI expert in active recall.");
      
      if (Array.isArray(flashcards)) {
        const user = auth.currentUser;
        const batch = flashcards.map(card => 
          addDoc(collection(db, 'flashcards'), {
            userId: user?.uid,
            noteId: activeNote.id,
            front: card.front,
            back: card.back,
            createdAt: new Date().toISOString(),
            nextReview: new Date().toISOString(),
          })
        );
        await Promise.all(batch);
        alert(`Neural pattern extraction complete: ${flashcards.length} flashcards generated.`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'flashcards');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) {
        setCurrentTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex-1 ml-72 flex h-screen bg-zinc-50 overflow-hidden">
      {/* Search & List Sidebar */}
      <div className="w-96 border-r border-zinc-200/60 bg-zinc-50 flex flex-col h-full overflow-hidden">
        <div className="p-10 pb-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-display font-medium tracking-tighter text-zinc-900 leading-none mb-2">Intelligence <span className="font-serif italic font-bold">Base</span></h2>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 leading-none">Knowledge Hub</p>
            </div>
            <button 
              onClick={() => {
                setActiveNote(null);
                setTopic('');
                setContent('');
                setCourseId('General');
                setNoteType('Rich Text');
                setCurrentTags([]);
              }}
              className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input 
              className="ouro-input pl-10 py-3 text-xs"
              placeholder="Search knowledge layer..."
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2 pb-10 space-y-3 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {notes.map((note, index) => {
              const course = courses.find(c => c.id === note.courseId);
              return (
                <motion.div
                  layout
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setActiveNote(note);
                    setTopic(note.topic);
                    setContent(note.content);
                    setCourseId(note.courseId || 'General');
                    setNoteType(note.type || 'Rich Text');
                    setCurrentTags(note.tags || []);
                  }}
                  className={cn(
                    "p-6 rounded-[1.75rem] transition-all cursor-pointer group relative border",
                    activeNote?.id === note.id 
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-2xl shadow-zinc-900/20" 
                      : "bg-white border-transparent hover:border-zinc-200 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-widest",
                        activeNote?.id === note.id ? "text-zinc-400" : "text-zinc-400"
                      )}>
                        {note.courseId === 'General' ? 'General Protocol' : (course?.title || 'Unknown Unit')}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold opacity-30">{formatDate(note.createdAt)}</span>
                  </div>
                  <h4 className="text-sm font-display font-bold truncate mb-2 leading-tight tracking-tight">{note.topic || 'Untitled Intel'}</h4>
                  <p className={cn(
                    "text-xs line-clamp-2 leading-relaxed h-8 mb-4", 
                    activeNote?.id === note.id ? "text-zinc-400 font-medium" : "text-zinc-500 font-medium"
                  )}>
                    {note.content}
                  </p>

                  <div className="flex gap-1.5 flex-wrap">
                    {note.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className={cn(
                        "px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-widest",
                        activeNote?.id === note.id ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-500"
                      )}>
                        {tag}
                      </span>
                    ))}
                    {note.tags?.length > 2 && (
                      <span className="text-[9px] font-mono font-bold opacity-30 flex items-center">+{note.tags.length - 2}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="absolute right-2 top-2 p-4 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Editor Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <header className="px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-100/50">
          <div className="flex flex-col gap-6 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 p-1.5 bg-zinc-100/50 rounded-2xl border border-zinc-100">
                {['Rich Text', 'Markdown', 'Voice'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                      noteType === type 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {isSaving && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-mono font-bold text-zinc-300 animate-pulse tracking-widest uppercase mr-4"
                    >
                      Syncing...
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !content}
                    className="ouro-button-secondary py-2 h-11 px-6 shadow-none flex items-center gap-2 group"
                  >
                    <Sparkles className={cn("w-3.5 h-3.5", isGenerating && "animate-pulse")} />
                    <span className="font-mono">AI ANALYZE</span>
                  </button>
                  <button 
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards || !activeNote || !content}
                    className="ouro-button-secondary py-2 h-11 px-6 shadow-none flex items-center gap-2 group"
                  >
                    <Brain className={cn("w-3.5 h-3.5", isGeneratingFlashcards && "animate-pulse")} />
                    <span className="font-mono text-[9px]">EXTRACT RECALL</span>
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !topic || !content}
                    className="ouro-button h-11 px-8"
                  >
                    <Save className="w-4 h-4" />
                    SAVE
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Entry Designation"
                className="w-full text-5xl font-display font-medium text-zinc-900 focus:outline-none placeholder:text-zinc-50 bg-transparent tracking-tighter leading-tight"
              />
              <div className="flex items-center gap-4 text-xs">
                <div className="relative">
                  <select 
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="bg-zinc-50 px-4 py-2 pr-10 rounded-xl border border-zinc-100 focus:ring-2 focus:ring-zinc-900/5 transition-all font-mono text-[10px] uppercase font-bold tracking-widest appearance-none cursor-pointer hover:bg-zinc-100"
                  >
                    <option value="General">UNALIGNED PROTOCOL</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 rotate-90 pointer-events-none" />
                </div>
                
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-1.5 rounded-xl min-w-[200px]">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <AnimatePresence>
                      {currentTags.map(tag => (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-900 text-white rounded-md text-[9px] font-mono font-bold flex items-center gap-1 group shadow-lg shadow-zinc-900/10"
                        >
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="+ Label"
                      className="bg-transparent border-none focus:outline-none placeholder:text-zinc-400 w-20 text-[10px] font-mono font-bold uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <div className={cn(
            "h-full transition-all duration-500 overflow-y-auto px-12 py-12 scrollbar-hide", 
            (noteType === 'Markdown' && showPreview) ? "max-w-[120rem] grid grid-cols-2 gap-20" : "max-w-5xl mx-auto"
          )}>
            <div className="relative group min-h-screen">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Initialize session. Documentation begins here."
                className="w-full min-h-[80vh] text-zinc-800 text-xl leading-[1.6] focus:outline-none resize-none placeholder:text-zinc-50 font-sans border-none bg-transparent"
              />
              {noteType === 'Markdown' && (
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="fixed bottom-10 right-10 p-4 bg-zinc-900 text-white rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all z-50 group"
                >
                  {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-[10px] font-mono font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    TOGGLE PREVIEW
                  </div>
                </button>
              )}
            </div>
            
            {noteType === 'Markdown' && showPreview && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="markdown-body h-full border-l border-zinc-100/50 pl-20 overflow-y-auto pb-40"
              >
                <Markdown>{content || '_Intelligence layer awaiting input..._'}</Markdown>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

