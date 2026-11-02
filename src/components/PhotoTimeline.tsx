import { Camera, Check, Download, ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import silhouette from '../assets/images/sihouette.png'
import BottomSheet from './BottomSheet'

export type ProgressPhoto = { id: string; recordedAt: string; image: string; capturedOn?: string; sourceHash?: string }

type PhotoTimelineProps = {
  photos: ProgressPhoto[]
  onAdd: (photos: ProgressPhoto[]) => Promise<void>
  onRemove: (id: string) => void
}

function photoDate(photo?: ProgressPhoto) {
  return photo?.capturedOn ? new Date(photo.capturedOn + 'T12:00:00') : new Date(photo?.recordedAt ?? '')
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') { reject(new Error('Could not read image')); return }
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.naturalWidth * scale)
        canvas.height = Math.round(image.naturalHeight * scale)
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.86))
      }
      image.onerror = () => reject(new Error('Could not decode image'))
      image.src = reader.result
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function PhotoTimeline({ photos, onAdd, onRemove }: PhotoTimelineProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [guideOpacity, setGuideOpacity] = useState(45)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const sortedPhotos = [...photos].sort((a, b) => (b.capturedOn ?? b.recordedAt.slice(0, 10)).localeCompare(a.capturedOn ?? a.recordedAt.slice(0, 10)) || b.recordedAt.localeCompare(a.recordedAt))
  const activePhotoIndex = Math.max(0, sortedPhotos.findIndex(photo => photo.id === activePhotoId))
  const setActivePhotoIndex = (index: number) => setActivePhotoId(sortedPhotos[index]?.id ?? null)


  useEffect(() => {
    let cancelled = false
    if (cameraOpen) {
      void navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then((stream) => {
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          void video.play().catch(() => undefined)
        }
      }).catch(() => setCameraOpen(false))
    }
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [cameraOpen])

  useEffect(() => {
    if (!cameraOpen || capturedImage) return
    const video = videoRef.current
    const stream = streamRef.current
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream
      void video.play().catch(() => undefined)
    }
  }, [cameraOpen, capturedImage])

  const [drafts, setDrafts] = useState<Array<ProgressPhoto & { name: string; included: boolean; inferred: boolean }>>([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkDate, setBulkDate] = useState('')
  const generation = useRef(0)
  const addFiles = async (files: File[]) => {
    const token = ++generation.current
    setReviewOpen(true)
    setBusy(true)
    setDrafts([])
    let skipped = 0
    const staged: Array<ProgressPhoto & { name: string; included: boolean; inferred: boolean }> = []
    try {
      const { parse } = await import('exifr')
      for (const file of files) {
        if (token !== generation.current) return
        setMessage(`Reading ${staged.length + skipped + 1} of ${files.length}`)
        try {
          const bytes = await file.arrayBuffer()
          const sourceHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('')
          const image = await readImage(file)
          if ([...photos, ...staged].some(photo => photo.sourceHash === sourceHash || photo.image === image)) { skipped++; continue }
          let capturedOn = ''
          try {
            const metadata = await parse(file, { pick: ['DateTimeOriginal', 'CreateDate'], reviveValues: false })
            const value = metadata?.DateTimeOriginal ?? metadata?.CreateDate
            const match = typeof value === 'string' ? /^(\d{4}):(\d{2}):(\d{2})/.exec(value) : null
            if (match) {
              const day = `${match[1]}-${match[2]}-${match[3]}`
              const date = new Date(day + 'T12:00:00Z')
              if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day) capturedOn = day
            }
          } catch { /* Missing metadata requires a manual date. */ }
          staged.push({ id: crypto.randomUUID(), recordedAt: capturedOn ? capturedOn + 'T12:00:00.000Z' : '', capturedOn, sourceHash, image, name: file.name, included: true, inferred: !!capturedOn })
        } catch { skipped++ }
      }
      if (token === generation.current) {
        setDrafts(staged)
        setMessage(`${staged.length} photos ready; ${skipped} duplicates or unreadable files skipped.`)
      }
    } catch {
      setMessage('Could not read this selection. Please try again.')
    } finally { if (token === generation.current) setBusy(false) }
  }
  const saveBatch = async () => {
    setSaving(true)
    setBusy(true)
    try {
      const batch = drafts.filter(photo => photo.included).map(({ id, image, capturedOn, sourceHash }) => ({ id, image, capturedOn, sourceHash, recordedAt: capturedOn + 'T12:00:00.000Z' }))
      await onAdd(batch)
      setReviewOpen(false)
      setDrafts([])
      setActivePhotoId([...batch].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]?.id ?? null)
      setTimelineOpen(true)
    } catch { setMessage('Could not save photos. Your selection is retained; please retry.') }
    finally { setBusy(false); setSaving(false) }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0)
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.88))
  }

  const saveCapture = async () => {
    if (!capturedImage) return
    try { await onAdd([{ id: crypto.randomUUID(), recordedAt: new Date().toISOString(), image: capturedImage }]) } catch { setMessage("Could not save photo."); return }
    setCapturedImage(null)
    setCameraOpen(false)
  }

  const download = (photo: ProgressPhoto) => {
    const link = document.createElement('a')
    link.href = photo.image
    link.download = `progress-${photo.recordedAt.slice(0, 10)}.jpg`
    link.click()
  }

  return (
    <section className="section-card photo-timeline">
      <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(event) => { void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
      <div className="photo-timeline__card" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.68), rgba(0,0,0,.18)), url("${sortedPhotos[0]?.image ?? silhouette}")` }}>
        <button type="button" className="photo-timeline__card-open" onClick={() => setTimelineOpen(true)} aria-label="Open progress photo timeline">
          <span className="photo-timeline__card-copy"><span className="kicker">Progress photos</span><strong>Photo timeline</strong><small>{sortedPhotos.length ? `${sortedPhotos.length} photos · scroll to compare` : 'Build a visual timeline of your progress'}</small></span>
        </button>
        <div className="photo-timeline__card-actions">
          <button type="button" className="photo-timeline__icon-action" onClick={() => setCameraOpen(true)} aria-label="Take progress photo" title="Take photo"><Camera size={18} /></button>
          <button type="button" className="photo-timeline__icon-action" onClick={() => fileRef.current?.click()} aria-label="Import progress photos" title="Import photos"><ImagePlus size={18} /></button>
        </div>
      </div>
      {!reviewOpen && message.startsWith("Could not") ? <p role="alert">{message}</p> : null}
      {reviewOpen ? <BottomSheet title="Import progress photos" description={message} onClose={() => { if (!saving) { generation.current++; setBusy(false); setReviewOpen(false); setDrafts([]) } }}>
        <label>Set date for all included photos <input type="date" value={bulkDate} onChange={event => setBulkDate(event.target.value)} /></label>
        <button disabled={busy || !bulkDate} onClick={() => setDrafts(current => current.map(photo => photo.included ? { ...photo, capturedOn: bulkDate, inferred: false } : photo))}>Apply date</button>
        <div style={{ display: 'grid', gap: 12 }}>
          {drafts.map(photo => <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input aria-label={`Include ${photo.name}`} type="checkbox" checked={photo.included} disabled={busy} onChange={event => setDrafts(current => current.map(item => item.id === photo.id ? { ...item, included: event.target.checked } : item))} />
            <img loading="lazy" src={photo.image} alt={photo.name} style={{ width: 64, height: 80, objectFit: 'cover' }} />
            <label>{photo.name}<input aria-label={`Date for ${photo.name}`} type="date" required value={photo.capturedOn ?? ''} disabled={busy} onChange={event => setDrafts(current => current.map(item => item.id === photo.id ? { ...item, capturedOn: event.target.value, inferred: false } : item))} />{!photo.capturedOn ? 'Date required' : photo.inferred ? 'From capture metadata' : 'Manually assigned'}</label>
          </div>)}
        </div>
        <button disabled={busy || !drafts.some(photo => photo.included) || drafts.some(photo => photo.included && !photo.capturedOn)} onClick={() => void saveBatch()}>Import {drafts.filter(photo => photo.included).length} photos</button>
      </BottomSheet> : null}
      {timelineOpen ? <BottomSheet className="photo-timeline__sheet photo-timeline__sheet--timeline" contentClassName="photo-timeline__sheet-content" headerActions={<button type="button" className="photo-timeline__close" onClick={() => setTimelineOpen(false)} aria-label="Close photo timeline">×</button>} kicker="Progress photos" title="Photo timeline" description="Swipe or drag the slider to compare dated photos." onClose={() => setTimelineOpen(false)}><button type="button" className="ghost-button" onClick={() => { setTimelineOpen(false); fileRef.current?.click() }}>Import photos</button><div className="photo-timeline__viewer">{sortedPhotos.length ? <><div className="photo-timeline__viewer-image"><img src={sortedPhotos[activePhotoIndex]?.image} alt={`Progress photo from ${photoDate(sortedPhotos[activePhotoIndex]).toLocaleDateString()}`} /></div><div className="photo-timeline__viewer-controls"><time>{photoDate(sortedPhotos[activePhotoIndex]).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time><div className="photo-timeline__viewer-actions"><button type="button" className="ghost-button icon-button" onClick={() => download(sortedPhotos[activePhotoIndex])} aria-label="Download photo"><Download size={17} /></button><button type="button" className="ghost-button icon-button" onClick={() => onRemove(sortedPhotos[activePhotoIndex].id)} aria-label="Delete photo"><Trash2 size={17} /></button></div></div>{sortedPhotos.length > 1 ? <label className="photo-timeline__scrubber"><span>{sortedPhotos.length - activePhotoIndex} / {sortedPhotos.length}</span><input type="range" min="0" max={sortedPhotos.length - 1} step="1" value={activePhotoIndex} onChange={(event) => setActivePhotoIndex(Number(event.target.value))} aria-label="Choose progress photo" /><span>{photoDate(sortedPhotos[0]).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span></label> : null}</> : <div className="photo-timeline__empty">No photos yet. Use the camera or upload icons to add one.</div>}</div></BottomSheet> : null}
      {cameraOpen ? <BottomSheet className="photo-timeline__sheet photo-timeline__sheet--camera" contentClassName="photo-timeline__sheet-content" headerActions={<button type="button" className="photo-timeline__close" onClick={() => { setCapturedImage(null); setCameraOpen(false) }} aria-label="Close camera">×</button>} kicker="Progress photo" title={capturedImage ? 'Review photo' : 'Camera'} description={capturedImage ? 'Check your pose, then save the photo to your timeline.' : 'Line up your pose with the adjustable guide overlay.'} onClose={() => { setCapturedImage(null); setCameraOpen(false) }}><div className="photo-timeline__camera">{capturedImage ? <img className="photo-timeline__captured-preview" src={capturedImage} alt="Captured progress photo preview" /> : <><video ref={videoRef} autoPlay playsInline muted /><div className="photo-timeline__guide" style={{ opacity: guideOpacity / 100 }} aria-hidden="true"><div /><div /><div /></div></>}</div><div className="photo-timeline__camera-controls"><label className="photo-timeline__guide-control" style={{ visibility: capturedImage ? 'hidden' : 'visible' }}><span>Guide</span><input aria-label="Guide opacity" type="range" min="10" max="90" value={guideOpacity} onChange={(event) => setGuideOpacity(Number(event.target.value))} /></label><div className={capturedImage ? 'photo-timeline__review-actions' : ''}>{capturedImage ? <><button type="button" className="photo-timeline__retake" onClick={() => setCapturedImage(null)} aria-label="Retake photo" title="Retake photo"><RotateCcw size={18} /></button><button type="button" className="photo-timeline__capture photo-timeline__capture--save" onClick={() => void saveCapture()} aria-label="Save photo" title="Save photo"><Check size={22} /></button></> : <button type="button" className="photo-timeline__capture" onClick={capture} aria-label="Capture photo"><Camera size={23} /></button>}</div><span className="photo-timeline__camera-spacer" /></div></BottomSheet> : null}
    </section>
  )
}
