import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/authStore'

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface GNode {
  id: string; label: string; type: 'estudiante' | 'tutor' | 'curso'
  x: number; y: number; vx: number; vy: number; fx: number; fy: number
}
interface GEdge { source: string; target: string; type: string }

// ── Constantes visuales por tipo de nodo ─────────────────────────────────────
const NODE_CONFIG = {
  estudiante: { r: 28, fill: '#1F3D2B', text: '#fff',  font: 600 },
  tutor:      { r: 22, fill: '#1E3A5F', text: '#fff',  font: 500 },
  curso:      { r: 16, fill: '#EFEFEC', text: '#1A1A1A', font: 500 },
}

const EDGE_CONFIG = {
  TOMA:       { stroke: '#1F3D2B', width: 1.5, dash: ''          },
  ENSENA:     { stroke: '#9B9B96', width: 1,   dash: '4,3'       },
  RECOMIENDA: { stroke: '#D97706', width: 2,   dash: ''          },
}

const EDGE_LABELS = {
  TOMA: 'toma', ENSENA: 'enseña', RECOMIENDA: 'guardó',
}

// ── Motor de física simple (Verlet) ──────────────────────────────────────────
const REPULSION  = 5000
const ATTRACTION = 0.03
const REST_LEN   = 130
const GRAVITY    = 0.015
const DAMPING    = 0.80

function tick(nodes: GNode[], edges: GEdge[], w: number, h: number) {
  const cx = w / 2, cy = h / 2
  nodes.forEach(n => { n.fx = 0; n.fy = 0 })

  // Repulsión entre todos los nodos
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x
      const dy = nodes[j].y - nodes[i].y
      const d2 = dx * dx + dy * dy || 1
      const d  = Math.sqrt(d2)
      const f  = REPULSION / d2
      nodes[i].fx -= f * dx / d;  nodes[i].fy -= f * dy / d
      nodes[j].fx += f * dx / d;  nodes[j].fy += f * dy / d
    }
  }

  // Atracción por aristas
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  edges.forEach(e => {
    const s = nodeMap[e.source]; const t = nodeMap[e.target]
    if (!s || !t) return
    const dx = t.x - s.x; const dy = t.y - s.y
    const d  = Math.sqrt(dx * dx + dy * dy) || 1
    const f  = ATTRACTION * (d - REST_LEN)
    s.fx += f * dx / d;  s.fy += f * dy / d
    t.fx -= f * dx / d;  t.fy -= f * dy / d
  })

  // Gravedad al centro
  nodes.forEach(n => {
    n.fx += GRAVITY * (cx - n.x)
    n.fy += GRAVITY * (cy - n.y)
  })

  // Integrar posiciones
  nodes.forEach(n => {
    n.vx = (n.vx + n.fx) * DAMPING
    n.vy = (n.vy + n.fy) * DAMPING
    n.x  = Math.max(36, Math.min(w - 36, n.x + n.vx))
    n.y  = Math.max(36, Math.min(h - 36, n.y + n.vy))
  })
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GraphView() {
  const { id } = useAuthStore()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const [nodes, setNodes] = useState<GNode[]>([])
  const [edges, setEdges] = useState<GEdge[]>([])
  const [dims, setDims]   = useState({ w: 360, h: 500 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GNode | null>(null)
  const rafRef = useRef<number>(0)
  const nodesRef = useRef<GNode[]>([])
  nodesRef.current = nodes

  // Medir contenedor
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Cargar datos del grafo
  useEffect(() => {
    api.get(`/grafo/${id}`)
      .then(({ data }) => {
        const w = dims.w, h = dims.h
        const initialized: GNode[] = data.nodes.map((n: any) => ({
          ...n,
          x: w / 2 + (Math.random() - 0.5) * w * 0.5,
          y: h / 2 + (Math.random() - 0.5) * h * 0.5,
          vx: 0, vy: 0, fx: 0, fy: 0,
        }))
        setNodes(initialized)
        setEdges(data.edges)
      })
      .finally(() => setLoading(false))
  }, [id])

  // Loop de animación
  useEffect(() => {
    if (nodes.length === 0) return
    let current = [...nodes]

    const loop = () => {
      tick(current, edges, dims.w, dims.h)
      setNodes([...current])
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [edges, dims, nodes.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-48px)] text-uvg-muted text-sm">
        Cargando grafo...
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] px-6 text-center">
        <p className="text-base font-medium text-uvg-text">Sin conexiones todavía</p>
        <p className="text-sm text-uvg-muted mt-1">Agregá cursos y horarios para ver el grafo.</p>
        <button onClick={() => navigate('/estudiante')} className="btn-primary mt-4">
          Ir al feed →
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-uvg-border flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-uvg-text">Tu grafo de conexiones</p>
          <p className="text-xs text-uvg-muted">
            {nodes.length} nodos · {edges.length} relaciones
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost text-xs">← Volver</button>
      </div>

      {/* SVG del grafo — ocupa todo el espacio disponible */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#FAFAF7]">
        <svg width={dims.w} height={dims.h} className="absolute inset-0">
          <defs>
            {/* Flechas para los edges */}
            {Object.entries(EDGE_CONFIG).map(([type, cfg]) => (
              <marker key={type} id={`arrow-${type}`}
                markerWidth="8" markerHeight="8" refX="6" refY="3"
                orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L8,3 z" fill={cfg.stroke} />
              </marker>
            ))}
          </defs>

          {/* Aristas */}
          {edges.map((e, i) => {
            const s = nodes.find(n => n.id === e.source)
            const t = nodes.find(n => n.id === e.target)
            if (!s || !t) return null
            const cfg = EDGE_CONFIG[e.type as keyof typeof EDGE_CONFIG]
              ?? EDGE_CONFIG.ENSENA
            // Acortar la línea para no tapar el nodo
            const dx = t.x - s.x, dy = t.y - s.y
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const tR = NODE_CONFIG[t.type as keyof typeof NODE_CONFIG]?.r ?? 16
            const x2 = t.x - dx / d * (tR + 6)
            const y2 = t.y - dy / d * (tR + 6)

            return (
              <g key={i}>
                <line
                  x1={s.x} y1={s.y} x2={x2} y2={y2}
                  stroke={cfg.stroke}
                  strokeWidth={cfg.width}
                  strokeDasharray={cfg.dash}
                  markerEnd={`url(#arrow-${e.type})`}
                  opacity={0.7}
                />
                {/* Label del edge en el punto medio */}
                <text
                  x={(s.x + t.x) / 2}
                  y={(s.y + t.y) / 2 - 4}
                  fontSize={9}
                  fill={cfg.stroke}
                  textAnchor="middle"
                  style={{ userSelect: 'none' }}
                  opacity={0.8}
                >
                  {EDGE_LABELS[e.type as keyof typeof EDGE_LABELS]}
                </text>
              </g>
            )
          })}

          {/* Nodos */}
          {nodes.map(n => {
            const cfg = NODE_CONFIG[n.type as keyof typeof NODE_CONFIG]
              ?? NODE_CONFIG.curso
            const isSelected = selected?.id === n.id
            return (
              <g key={n.id}
                onClick={() => setSelected(isSelected ? null : n)}
                style={{ cursor: 'pointer' }}>
                <circle
                  cx={n.x} cy={n.y} r={cfg.r}
                  fill={cfg.fill}
                  stroke={isSelected ? '#D97706' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                />
                <text
                  x={n.x} y={n.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={n.type === 'estudiante' ? 11 : n.type === 'tutor' ? 10 : 9}
                  fontWeight={cfg.font}
                  fill={cfg.text}
                  style={{ userSelect: 'none' }}
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Leyenda + info del nodo seleccionado */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-uvg-border bg-uvg-surface">
        {selected ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-uvg-text">{selected.label}</p>
              <p className="text-2xs text-uvg-muted capitalize">{selected.type}</p>
            </div>
            <button onClick={() => setSelected(null)}
              className="text-uvg-muted text-xs hover:text-uvg-text">×</button>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-uvg-muted">
                <span className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                  style={{ background: cfg.fill, border: '1px solid #E5E5E2' }} />
                <span className="capitalize">{type}</span>
              </span>
            ))}
            {Object.entries(EDGE_CONFIG).map(([type, cfg]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-uvg-muted">
                <span className="inline-block h-px w-5 flex-shrink-0"
                  style={{ background: cfg.stroke, height: '1.5px' }} />
                <span>{EDGE_LABELS[type as keyof typeof EDGE_LABELS]}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
