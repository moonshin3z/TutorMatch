export interface EstudianteSolicitud {
  id: number
  nombre: string
  carrera: string
  semestre: number
  email: string
  modalidad: string
  nivel: string
  cursos: string[]
  horarios: string[]
  estado: 'PENDIENTE' | 'COMPLETADO'
  fecha: string
}

interface Props { solicitud: EstudianteSolicitud }

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre']
function formatDate(s: string) {
  if (!s) return ''
  const [, m, d] = s.split('-').map(Number)
  return `${d} de ${MONTHS[m - 1]}`
}

const PALETA = [
  'bg-[#EEF4F1] text-[#1F3D2B]',
  'bg-[#EEF0FA] text-[#1E3A5F]',
  'bg-[#FDF3EE] text-[#7A3B1F]',
  'bg-[#F4F0F9] text-[#4A1F6B]',
]
function bgAvatar(n: string) { return PALETA[n.charCodeAt(0) % PALETA.length] }
function iniciales(n: string) {
  return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

const ORDINALS: Record<number, string> = {
  1:'1er',2:'2do',3:'3er',4:'4to',5:'5to',6:'6to',7:'7mo',8:'8vo',9:'9no',10:'10mo',
}
function ordinal(n: number) { return ORDINALS[n] ?? `${n}°` }

const MODALIDAD_LABEL: Record<string, string> = {
  PRESENCIAL: 'Presencial', VIRTUAL: 'Virtual', AMBAS: 'Sin preferencia',
}

export default function SolicitudCard({ solicitud }: Props) {
  const completado = solicitud.estado === 'COMPLETADO'
  const cursos = (solicitud.cursos ?? []).slice(0, 3)
  const extCursos = (solicitud.cursos?.length ?? 0) - 3
  const horarios = (solicitud.horarios ?? []).slice(0, 2)

  return (
    <article className="bg-white border border-[#E5E5E2] rounded-[8px] p-4
      transition-colors duration-150 hover:border-[#1F3D2B]">

      <div className="flex gap-3">
        {/* Avatar 56×56 */}
        <div className={`w-14 h-14 rounded-[6px] flex-shrink-0
          flex items-center justify-center text-[13px] font-semibold select-none
          ${bgAvatar(solicitud.nombre)}`}>
          {iniciales(solicitud.nombre)}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
          {/* Nombre + estado */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-[16px] font-[500] text-[#1A1A1A] leading-tight truncate">
              {solicitud.nombre}
            </p>
            <span className={`text-[11px] flex-shrink-0 leading-none mt-0.5 ${
              completado ? 'text-[#1F3D2B]' : 'text-[#6B6B66]'
            }`}>
              {completado ? '✓ completada' : 'pendiente'}
            </span>
          </div>

          {/* Carrera */}
          {solicitud.carrera && (
            <p className="text-[13px] text-[#6B6B66] leading-snug">
              {solicitud.carrera}{solicitud.semestre > 0 && ` · ${ordinal(solicitud.semestre)} año`}
            </p>
          )}

          {/* Materias que necesita */}
          {cursos.length > 0 && (
            <p className="text-[13px] text-[#1A1A1A] leading-snug">
              Necesita: {cursos.join(' · ')}
              {extCursos > 0 && <span className="text-[#6B6B66]"> +{extCursos} más</span>}
            </p>
          )}

          {/* Modalidad · nivel */}
          {(solicitud.modalidad || solicitud.nivel) && (
            <p className="text-[13px] text-[#6B6B66] leading-snug">
              {[MODALIDAD_LABEL[solicitud.modalidad], solicitud.nivel].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Footer: horarios + fecha + contactar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E2]">
        <div className="flex flex-col gap-0.5">
          {horarios.length > 0 && (
            <p className="text-[12px] text-[#6B6B66]">
              {horarios.join(' · ')}
            </p>
          )}
          {solicitud.fecha && (
            <p className="text-[12px] text-[#6B6B66]">Guardado el {formatDate(solicitud.fecha)}</p>
          )}
        </div>

        {solicitud.email && (
          <a
            href={`mailto:${solicitud.email}?subject=Tutoría — TutorMatch UVG`}
            className="text-[13px] text-[#1F3D2B] font-[500] border border-[#1F3D2B]
              rounded-[6px] px-3 py-1.5 hover:bg-[#EEF4F1] transition-colors flex-shrink-0"
          >
            Contactar
          </a>
        )}
      </div>
    </article>
  )
}
