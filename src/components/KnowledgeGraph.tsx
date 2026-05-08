import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Network, Info } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

const initialData = {
  nodes: [
    { id: 'Marketing', group: 1, label: 'Marketing' },
    { id: 'Finance', group: 1, label: 'Finance' },
    { id: 'Ops', group: 1, label: 'Operations' },
    { id: 'Strategy', group: 1, label: 'Strategy' },
    { id: 'Psych', group: 2, label: 'Consumer Psychology' },
    { id: 'Supply', group: 2, label: 'Supply Chain' },
    { id: 'Idea1', group: 3, label: 'AI Logistics SaaS' },
    { id: 'Idea2', group: 3, label: 'Eco Fashion' },
  ],
  links: [
    { source: 'Marketing', target: 'Psych', value: 1 },
    { source: 'Ops', target: 'Supply', value: 1 },
    { source: 'Supply', target: 'Idea1', value: 2 },
    { source: 'Strategy', target: 'Idea1', value: 2 },
    { source: 'Marketing', target: 'Idea2', value: 2 },
  ]
};

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height] as any);

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(initialData.nodes as Node[])
      .force('link', d3.forceLink<Node, Link>(initialData.links as Link[]).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(initialData.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    const node = svg.append('g')
      .selectAll('g')
      .data(initialData.nodes)
      .join('g')
      .call(drag(simulation) as any);

    node.append('circle')
      .attr('r', 12)
      .attr('fill', (d: any) => {
        if (d.group === 1) return '#000000';
        if (d.group === 2) return '#71717a';
        return '#3b82f6';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.label)
      .attr('x', 18)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter')
      .attr('fill', '#3f3f46');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
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
  }, []);

  return (
    <div className="flex-1 ml-72 h-screen flex flex-col bg-zinc-50 font-sans">
      <header className="p-10 pb-4">
        <h1 className="text-4xl font-display font-bold text-zinc-900 mb-2">Knowledge Graph</h1>
        <p className="text-zinc-500 font-medium">Visualizing your semantic ecosystem and conceptual leverage.</p>
      </header>
      
      <div ref={containerRef} className="flex-1 relative m-10 premium-card bg-white border border-zinc-200 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-zinc-100 rounded-lg text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-zinc-900" /> Subject Nodes
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-zinc-100 rounded-lg text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-zinc-400" /> Theory Fragments
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-zinc-100 rounded-lg text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Venture Seeds
          </div>
        </div>

        <div className="absolute bottom-6 right-6">
           <div className="w-64 p-4 glass rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-zinc-900" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Semantic Pulse</h4>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                The nodes represent your knowledge fragments. Drag them to re-arrange the gravity of your intellectual network.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
