import { Camera, Check, Download, ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import silhouette from '../assets/images/sihouette.png'
import BottomSheet from './BottomSheet'

export type ProgressPhoto = { id: string; recordedAt: string; image: string }

type PhotoTimelineProps = {
  photos: ProgressPhoto[]
  onAdd: (photo: ProgressPhoto) => void
  onRemove: (id: string) => void
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
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const sortedPhotos = [...photos].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))

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

  const addFile = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    let recordedAt = new Date().toISOString()
    try {
      const source = await file.arrayBuffer()
      const view = new DataView(source)
      let offset = 2
      while (offset < view.byteLength - 10) {
        if (view.getUint16(offset) !== 0xffe1) { offset += 2; continue }
        const length = view.getUint16(offset + 2)
        if (new TextDecoder().decode(new Uint8Array(source, offset + 4, 6)) === 'Exif\0\0') {
          const tiff = offset + 10
          const little = view.getUint16(tiff) === 0x4949
          const ifd = tiff + view.getUint32(tiff + 4, little)
          const entries = view.getUint16(ifd, little)
          for (let index = 0; index < entries; index += 1) {
            const entry = ifd + 2 + index * 12
            if (view.getUint16(entry, little) === 0x9003) {
              const start = tiff + view.getUint32(entry + 8, little)
              const date = new TextDecoder().decode(new Uint8Array(source, start, 19)).replace(/^([0-9]{4}):([0-9]{2}):([0-9]{2})/, '$1-$2-$3').replace(' ', 'T')
              const parsed = new Date(date)
              if (!Number.isNaN(parsed.getTime())) recordedAt = parsed.toISOString()
              break
            }
          }
          break
        }
        offset += length
      }
    } catch { /* Use import time when image metadata has no readable capture date. */ }
    onAdd({ id: crypto.randomUUID(), recordedAt, image: await readImage(file) })
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

  const saveCapture = () => {
    if (!capturedImage) return
    onAdd({ id: crypto.randomUUID(), recordedAt: new Date().toISOString(), image: capturedImage })
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
      <input ref={fileRef} hidden type="file" accept="image/*" onChange={(event) => { void addFile(event.target.files?.[0]); event.target.value = '' }} />
      <div className="photo-timeline__card" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.68), rgba(0,0,0,.18)), url("${sortedPhotos[0]?.image ?? silhouette}")` }}>
        <button type="button" className="photo-timeline__card-open" onClick={() => setTimelineOpen(true)} aria-label="Open progress photo timeline">
          <span className="photo-timeline__card-copy"><span className="kicker">Progress photos</span><strong>Photo timeline</strong><small>{sortedPhotos.length ? `${sortedPhotos.length} photos · scroll to compare` : 'Build a visual timeline of your progress'}</small></span>
        </button>
        <div className="photo-timeline__card-actions">
          <button type="button" className="photo-timeline__icon-action" onClick={() => setCameraOpen(true)} aria-label="Take progress photo" title="Take photo"><Camera size={18} /></button>
          <button type="button" className="photo-timeline__icon-action" onClick={() => fileRef.current?.click()} aria-label="Upload progress photo" title="Upload photo"><ImagePlus size={18} /></button>
        </div>
      </div>
      {timelineOpen ? <BottomSheet className="photo-timeline__sheet photo-timeline__sheet--timeline" contentClassName="photo-timeline__sheet-content" headerActions={<button type="button" className="photo-timeline__close" onClick={() => setTimelineOpen(false)} aria-label="Close photo timeline">×</button>} kicker="Progress photos" title="Photo timeline" description="Swipe or drag the slider to compare dated photos." onClose={() => setTimelineOpen(false)}><div className="photo-timeline__viewer">{sortedPhotos.length ? <><div className="photo-timeline__viewer-image"><img src={sortedPhotos[activePhotoIndex]?.image} alt={`Progress photo from ${new Date(sortedPhotos[activePhotoIndex]?.recordedAt ?? '').toLocaleDateString()}`} /></div><div className="photo-timeline__viewer-controls"><time>{new Date(sortedPhotos[activePhotoIndex]?.recordedAt ?? '').toLocaleDateString(undefined, { dateStyle: 'medium' })}</time><div className="photo-timeline__viewer-actions"><button type="button" className="ghost-button icon-button" onClick={() => download(sortedPhotos[activePhotoIndex])} aria-label="Download photo"><Download size={17} /></button><button type="button" className="ghost-button icon-button" onClick={() => onRemove(sortedPhotos[activePhotoIndex].id)} aria-label="Delete photo"><Trash2 size={17} /></button></div></div>{sortedPhotos.length > 1 ? <label className="photo-timeline__scrubber"><span>{sortedPhotos.length - activePhotoIndex} / {sortedPhotos.length}</span><input type="range" min="0" max={sortedPhotos.length - 1} step="1" value={activePhotoIndex} onChange={(event) => setActivePhotoIndex(Number(event.target.value))} aria-label="Choose progress photo" /><span>{new Date(sortedPhotos[0].recordedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span></label> : null}</> : <div className="photo-timeline__empty">No photos yet. Use the camera or upload icons to add one.</div>}</div></BottomSheet> : null}
      {cameraOpen ? <BottomSheet className="photo-timeline__sheet photo-timeline__sheet--camera" contentClassName="photo-timeline__sheet-content" headerActions={<button type="button" className="photo-timeline__close" onClick={() => { setCapturedImage(null); setCameraOpen(false) }} aria-label="Close camera">×</button>} kicker="Progress photo" title={capturedImage ? 'Review photo' : 'Camera'} description={capturedImage ? 'Check your pose, then save the photo to your timeline.' : 'Line up your pose with the adjustable guide overlay.'} onClose={() => { setCapturedImage(null); setCameraOpen(false) }}><div className="photo-timeline__camera">{capturedImage ? <img className="photo-timeline__captured-preview" src={capturedImage} alt="Captured progress photo preview" /> : <><video ref={videoRef} autoPlay playsInline muted /><div className="photo-timeline__guide" style={{ opacity: guideOpacity / 100 }} aria-hidden="true"><div /><div /><div /></div></>}</div><div className="photo-timeline__camera-controls"><label className="photo-timeline__guide-control" style={{ visibility: capturedImage ? 'hidden' : 'visible' }}><span>Guide</span><input aria-label="Guide opacity" type="range" min="10" max="90" value={guideOpacity} onChange={(event) => setGuideOpacity(Number(event.target.value))} /></label><div className={capturedImage ? 'photo-timeline__review-actions' : ''}>{capturedImage ? <><button type="button" className="photo-timeline__retake" onClick={() => setCapturedImage(null)} aria-label="Retake photo" title="Retake photo"><RotateCcw size={18} /></button><button type="button" className="photo-timeline__capture photo-timeline__capture--save" onClick={saveCapture} aria-label="Save photo" title="Save photo"><Check size={22} /></button></> : <button type="button" className="photo-timeline__capture" onClick={capture} aria-label="Capture photo"><Camera size={23} /></button>}</div><span className="photo-timeline__camera-spacer" /></div></BottomSheet> : null}
    </section>
  )
}
