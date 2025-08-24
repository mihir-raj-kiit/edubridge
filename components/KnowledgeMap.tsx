'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Network } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Node {
  id: string
  label: string
  x?: number
  y?: number
}

interface Edge {
  from: string
  to: string
  label?: string
}

interface Graph {
  nodes: Node[]
  edges: Edge[]
}

interface KnowledgeMapData {
  graphs: Graph[]
}

interface KnowledgeMapProps {
  data: KnowledgeMapData | null
  className?: string
}

// Static layout parameters
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 400
const NODE_RADIUS = 20

export default function KnowledgeMap({ data, className }: KnowledgeMapProps) {
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Simple static layout algorithm
  const calculateStaticLayout = (graphNodes: Node[], graphEdges: Edge[]) => {
    const nodeCount = graphNodes.length
    if (nodeCount === 0) return []

    // Simple circular layout for static positioning
    const centerX = CANVAS_WIDTH / 2
    const centerY = CANVAS_HEIGHT / 2
    const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.3

    return graphNodes.map((node, index) => {
      if (nodeCount === 1) {
        return { ...node, x: centerX, y: centerY }
      }
      
      const angle = (index / nodeCount) * 2 * Math.PI
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })
  }

  // Initialize graph data with static positions
  useEffect(() => {
    if (!data || !data.graphs || data.graphs.length === 0) {
      setNodes([])
      setEdges([])
      return
    }

    const currentGraph = data.graphs[currentGraphIndex]
    if (!currentGraph) return

    const layoutNodes = calculateStaticLayout(currentGraph.nodes, currentGraph.edges)
    setNodes(layoutNodes)
    setEdges(currentGraph.edges)
  }, [data, currentGraphIndex])

  // Get node style based on type
  const getNodeStyle = (node: Node) => {
    const baseStyles = {
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2
    }

    // Different colors based on node content
    if (node.label.toLowerCase().includes('cost') || node.label.toLowerCase().includes('mc') || node.label.toLowerCase().includes('ac')) {
      return { ...baseStyles, fill: '#10b981', stroke: '#059669' }
    }
    if (node.label.toLowerCase().includes('relationship') || node.label.toLowerCase().includes('rule')) {
      return { ...baseStyles, fill: '#ef4444', stroke: '#dc2626' }
    }
    
    return baseStyles
  }

  if (!data || !data.graphs || data.graphs.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-primary" />
            <span>Knowledge Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No knowledge map data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-primary" />
            <span>Knowledge Map</span>
            {data.graphs.length > 1 && (
              <Badge variant="secondary">
                {currentGraphIndex + 1} of {data.graphs.length}
              </Badge>
            )}
          </CardTitle>
        </div>
        
        {data.graphs.length > 1 && (
          <div className="flex space-x-2 mt-2">
            {data.graphs.map((_, index) => (
              <Button
                key={index}
                variant={currentGraphIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentGraphIndex(index)}
              >
                Graph {index + 1}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          >
            {/* Edges */}
            <g className="edges">
              {edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.from)
                const targetNode = nodes.find(n => n.id === edge.to)
                
                if (!sourceNode || !targetNode) return null

                return (
                  <line
                    key={`edge-${index}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#64748b"
                    strokeWidth="2"
                    opacity="0.6"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {nodes.map((node) => {
                const style = getNodeStyle(node)
                
                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS}
                      {...style}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="600"
                      className="select-none"
                    >
                      {node.label.length > 8 ? node.label.substring(0, 8) + '...' : node.label}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#64748b"
                />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>General concepts</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Cost-related terms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Relationships/Rules</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
