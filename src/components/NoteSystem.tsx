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
  EyeOff
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

    // Fetch courses for the dropdown
    const qCourses = query(collection(db, 'courses'), where('userId', '==', user.uid));
    const unsubscribeCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

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
      if (activeNote) {
        // Clean payload: remove 'id' and only update permitted fields
        await setDoc(doc(db, 'notes', activeNote.id), {
          userId: activeNote.userId,
          createdAt: activeNote.createdAt,
          topic,
          content,
          courseId,
          type: noteType,
          tags: currentTags,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'notes'), {
          userId: user?.uid,
          topic,
          content,
          courseId,
          type: noteType,
          tags: currentTags,
          createdAt: new Date().toISOString(),
        });
        setTopic('');
        setContent('');
        setCurrentTags([]);
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
      
      // We append AI result to content for MVP simplicity
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
    <div className="flex-1 ml-72 flex h-screen bg-zinc-50 font-sans overflow-hidden">
      {/* List Sidebar */}
      <div className="w-80 border-r border-zinc-200 bg-white flex flex-col h-full">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold">Knowledge</h2>
          <button 
            onClick={() => {
              setActiveNote(null);
              setTopic('');
              setContent('');
              setCourseId('General');
              setNoteType('Rich Text');
              setCurrentTags([]);
            }}
            className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-all font-bold"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {notes.map((note) => {
            const course = courses.find(c => c.id === note.courseId);
            return (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNote(note);
                  setTopic(note.topic);
                  setContent(note.content);
                  setCourseId(note.courseId || 'General');
                  setNoteType(note.type || 'Rich Text');
                  setCurrentTags(note.tags || []);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all group relative cursor-pointer",
                  activeNote?.id === note.id ? "bg-zinc-900 text-white shadow-lg" : "hover:bg-zinc-100"
                )}
              >
                <div className="flex justify-between items-start mb-1 pointer-events-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {note.courseId === 'General' ? 'General' : (course?.title || 'Unknown')}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-30">{note.type || 'Rich Text'}</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-40">{formatDate(note.createdAt)}</span>
                </div>
              <h4 className="text-sm font-bold truncate mb-1 pr-6 pointer-events-none">{note.topic}</h4>
              <p className={cn("text-xs line-clamp-2 leading-relaxed opacity-60 pointer-events-none", activeNote?.id === note.id ? "text-zinc-300" : "text-zinc-500")}>
                {note.content}
              </p>

              <div className="flex gap-1 flex-wrap mt-2 pointer-events-none">
                {note.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                    activeNote?.id === note.id ? "bg-white/10 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {tag}
                  </span>
                ))}
                {note.tags?.length > 3 && (
                  <span className="text-[8px] font-bold opacity-40">+{note.tags.length - 3}</span>
                )}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="absolute right-4 bottom-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        <header className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex flex-col gap-3 w-full max-w-2xl">
            <div className="flex gap-2">
              {['Rich Text', 'Markdown', 'Voice'].map((type) => (
                <button
                  key={type}
                  onClick={() => setNoteType(type)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                    noteType === type 
                      ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                      : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Thesis Topic / Lecture Name"
              className="text-3xl font-display font-bold text-zinc-900 focus:outline-none placeholder:text-zinc-100 bg-transparent"
            />
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
               <select 
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="bg-zinc-50 px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-zinc-900 transition-all font-mono uppercase tracking-widest appearance-none cursor-pointer"
              >
                <option value="General">GENERAL PROTOCOL</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <div className="h-3 w-px bg-zinc-200" />
              
              <div className="flex items-center gap-2 flex-wrap max-w-md bg-zinc-50/50 p-1.5 rounded-xl border border-zinc-100 min-w-[200px]">
                <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <AnimatePresence>
                    {currentTags.map(tag => (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={tag}
                        className="px-2 py-0.5 bg-zinc-900 text-white rounded-md text-[9px] font-bold flex items-center gap-1 group shadow-sm shadow-zinc-900/10"
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
                    placeholder="+ Add Tag"
                    className="bg-transparent border-none focus:outline-none placeholder:text-zinc-300 w-24 text-[10px] font-bold"
                  />
                </div>
              </div>

              <div className="h-3 w-px bg-zinc-200" />
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> AUTO-SAVE ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={handleGenerateAI}
              disabled={isGenerating || !content}
              className="px-5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-zinc-900 disabled:opacity-50 transition-all font-mono"
            >
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-pulse")} />
              {isGenerating ? "NEURAL SYNC..." : "AI ANALYZE"}
            </button>
            <button 
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingFlashcards || !activeNote || !content}
              className="px-5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-zinc-900 disabled:opacity-50 transition-all font-mono"
            >
              <Brain className={cn("w-4 h-4", isGeneratingFlashcards && "animate-pulse")} />
              {isGeneratingFlashcards ? "EXTRACTING..." : "GEN FLASHCARDS"}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !topic || !content}
              className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg shadow-zinc-900/10"
            >
              <Save className="w-4 h-4" />
              SAVE COMMIT
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12">
          <div className={cn(
            "mx-auto h-full transition-all duration-500", 
            (noteType === 'Markdown' && showPreview) ? "max-w-7xl grid grid-cols-2 gap-12" : "max-w-3xl"
          )}>
            <div className="relative h-full">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Begin knowledge capture... Use markdown for structure."
                className="w-full h-full text-zinc-800 text-lg leading-relaxed focus:outline-none resize-none placeholder:text-zinc-100 font-sans border-none"
              />
              {noteType === 'Markdown' && (
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="absolute bottom-4 right-4 p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 shadow-sm"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            {noteType === 'Markdown' && showPreview && (
              <div className="markdown-body h-full border-l border-zinc-100 pl-12 overflow-y-auto prose prose-zinc max-w-none prose-h1:text-2xl prose-h2:text-xl prose-p:leading-relaxed">
                <Markdown>{content || '_Live preview will manifest here..._'}</Markdown>
              </div>
            )}
          </div>
        </main>

        <footer className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
            <Brain className="w-4 h-4" /> Summary Layer
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
            <Lightbulb className="w-4 h-4" /> Venture Insights
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
            <Tag className="w-4 h-4" /> Multi-Tagging
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
            <BookOpen className="w-4 h-4" /> Flashcards
          </div>
        </footer>
      </div>
    </div>
  );
}
