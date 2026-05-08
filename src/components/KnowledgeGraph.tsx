import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Info, BookOpen, Target, X, Plus } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
  type: 'subject' | 'course' | 'idea' | 'note';
  progress?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

const SUBJECT_NODES = [
  { id: 'Marketing', group: 1, label: 'Marketing', type: 'subject' as const },
  { id: 'Finance', group: 1, label: 'Finance', type: 'subject' as const },
  { id: 'Ops', group: 1, label: 'Operations', type: 'subject' as const },
  { id: 'Strategy', group: 1, label: 'Strategy', type: 'subject' as const },
  { id: 'Psych', group: 1, label: 'Psychology', type: 'subject' as const },
  { id: 'Econ', group: 1, label: 'Economics', type: 'subject' as const },
];

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedLinks, setHighlightedLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qCourses = query(collection(db, 'courses'), where('userId', '==', user.uid));
    const unsubscribeCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'courses'));

    const qNotes = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubscribeNotes = onSnapshot(qNotes, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'notes'));

    return () => {
      unsubscribeCourses();
      unsubscribeNotes();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Prepare dynamic data
    const nodes: Node[] = [...SUBJECT_NODES];
    const links: Link[] = [];

    courses.forEach(course => {
      const courseNodeId = `course-${course.id}`;
      nodes.push({
        id: courseNodeId,
        group: 2,
        label: course.title,
        type: 'course',
        progress: course.progress || 0
      });

      SUBJECT_NODES.forEach(subject => {
        if (course.title.toLowerCase().includes(subject.label.toLowerCase()) || 
            (subject.id === 'Psych' && (course.title.toLowerCase().includes('behavioral') || course.title.toLowerCase().includes('psychology'))) ||
            (subject.id === 'Econ' && (course.title.toLowerCase().includes('economy') || course.title.toLowerCase().includes('economics'))) ||
            (subject.id === 'Ops' && (course.title.toLowerCase().includes('operations') || course.title.toLowerCase().includes('supply')))) {
          links.push({
            source: courseNodeId,
            target: subject.id,
            value: 2
          });
        }
      });
    });

    notes.forEach(note => {
      const noteNodeId = `note-${note.id}`;
      nodes.push({
        id: noteNodeId,
        group: 3,
        label: note.topic || 'Intel Node',
        type: 'note'
      });

      // Link notes to courses they mention or subjects
      courses.forEach(course => {
        if (note.topic?.toLowerCase().includes(course.title.toLowerCase()) || 
            note.content?.toLowerCase().includes(course.title.toLowerCase())) {
          links.push({ source: noteNodeId, target: `course-${course.id}`, value: 1 });
        }
      });

      SUBJECT_NODES.forEach(subject => {
        if (note.topic?.toLowerCase().includes(subject.label.toLowerCase()) || 
            note.content?.toLowerCase().includes(subject.label.toLowerCase())) {
          links.push({ source: noteNodeId, target: subject.id, value: 1 });
        }
      });
    });

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height] as any);

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .attr('class', 'transition-all duration-300');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        
        // Highlighting logic
        const neighbors = new Set<string>();
        const neighborLinks = new Set<string>();
        neighbors.add(d.id);

        links.forEach((l: any) => {
          if (l.source.id === d.id) {
            neighbors.add(l.target.id);
            neighborLinks.add(`${l.source.id}-${l.target.id}`);
          } else if (l.target.id === d.id) {
            neighbors.add(l.source.id);
            neighborLinks.add(`${l.source.id}-${l.target.id}`);
          }
        });

        setHighlightedNodes(neighbors);
        setHighlightedLinks(neighborLinks);

        // Visual update
        node.transition().duration(500).style('opacity', n => neighbors.has(n.id) ? 1 : 0.1);
        link.transition().duration(500)
            .style('opacity', l => neighborLinks.has(`${(l.source as any).id}-${(l.target as any).id}`) ? 1 : 0.05)
            .style('stroke', l => neighborLinks.has(`${(l.source as any).id}-${(l.target as any).id}`) ? '#18181b' : '#e5e7eb');
      });

    node.append('circle')
      .attr('r', d => d.type === 'course' ? 18 : d.type === 'note' ? 10 : 14)
      .attr('fill', d => {
        if (d.type === 'subject') return '#000000';
        if (d.type === 'course') return '#3b82f6';
        if (d.type === 'note') return '#10b981';
        return '#71717a';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('class', 'transition-all duration-300 shadow-2xl');

    node.append('text')
      .text(d => d.label)
      .attr('x', d => d.type === 'course' ? 26 : 22)
      .attr('y', 5)
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('font-family', 'Outfit')
      .attr('fill', '#18181b')
      .attr('class', 'pointer-events-none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => d.x ? `translate(${d.x},${d.y})` : '');
    });

    svg.on('click', () => {
      setSelectedNode(null);
      setHighlightedNodes(new Set());
      setHighlightedLinks(new Set());
      node.transition().duration(500).style('opacity', 1);
      link.transition().duration(500).style('opacity', 0.4).style('stroke', '#e5e7eb');
    });

    function drag(simulation: d3.Simulation<Node, Link>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [courses, notes]);

  return (
    <div className="flex-1 ml-72 h-screen flex flex-col bg-zinc-50 overflow-hidden">
      <header className="p-12 pb-6 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-zinc-400 uppercase mb-4 leading-none">Semantic Core</p>
          <h1 className="text-6xl font-display font-medium text-zinc-900 tracking-tighter leading-none">
            Knowledge <span className="font-serif italic font-bold">Graph</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-zinc-100 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest leading-none">
            <div className="w-2 h-2 rounded-full bg-zinc-900" /> Domains
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-zinc-100 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest leading-none">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Units
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white shadow-sm border border-zinc-100 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest leading-none">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Intel
          </div>
        </div>
      </header>
      
      <div ref={containerRef} className="flex-1 relative mx-12 mb-12 bg-white rounded-[3rem] border border-zinc-200/60 overflow-hidden shadow-sm">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-10 right-10 w-80 glass border border-zinc-200/50 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto h-fit"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    selectedNode.type === 'course' ? "bg-blue-500 shadow-blue-500/20" : 
                    selectedNode.type === 'note' ? "bg-emerald-500 shadow-emerald-500/20" :
                    "bg-zinc-900 shadow-zinc-900/20"
                  )}>
                    {selectedNode.type === 'course' ? <BookOpen className="w-6 h-6" /> : 
                     selectedNode.type === 'note' ? <Plus className="w-6 h-6" /> :
                     <Target className="w-6 h-6" />}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedNode(null);
                      setHighlightedNodes(new Set());
                      setHighlightedLinks(new Set());
                      d3.selectAll('g').transition().duration(500).style('opacity', 1);
                      d3.selectAll('line').transition().duration(500).style('opacity', 0.4).style('stroke', '#e5e7eb');
                    }}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>

                <h3 className="text-2xl font-display font-bold text-zinc-900 mb-2 leading-tight">{selectedNode.label}</h3>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 leading-none">
                  {selectedNode.type === 'course' ? 'Academic Protocol' : 'Subject Domain'}
                </p>

                {selectedNode.type === 'course' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 leading-none">
                        <span>Absorption Progress</span>
                        <span className="text-blue-500">{selectedNode.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedNode.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      This intelligence unit is synaptically linked to your primary domains in the system layer.
                    </p>
                  </div>
                )}
                
                {selectedNode.type === 'subject' && (
                  <div className="space-y-6">
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Structural pillar. Conceptual leverage is maximized when high-progress units are clustered here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-10 right-10">
           <div className="p-8 glass rounded-[2.5rem] border border-zinc-200/50 max-w-xs shadow-xl shadow-zinc-900/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Semantic Guide</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Target a node to analyze connectivity and monitor intellectual absorption depth across your ecosystem.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

