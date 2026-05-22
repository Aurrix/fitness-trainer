import BottomSheet from './BottomSheet'
import type { ReleaseNoteBundle } from '../lib/release-notes'

type MarkdownBlock =
  | {
      id: string
      items: string[]
      type: 'list'
    }
  | {
      id: string
      level: number
      text: string
      type: 'heading'
    }
  | {
      id: string
      text: string
      type: 'paragraph'
    }

type ReleaseNotesDialogProps = {
  bundle: ReleaseNoteBundle
  onClose: () => void
}

function parseMarkdownBlocks(markdown: string) {
  const blocks: MarkdownBlock[] = []
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let pendingList: string[] = []
  let pendingParagraph: string[] = []

  function flushList() {
    if (!pendingList.length) {
      return
    }

    blocks.push({
      id: `list-${blocks.length}`,
      items: pendingList,
      type: 'list',
    })
    pendingList = []
  }

  function flushParagraph() {
    if (!pendingParagraph.length) {
      return
    }

    blocks.push({
      id: `paragraph-${blocks.length}`,
      text: pendingParagraph.join(' '),
      type: 'paragraph',
    })
    pendingParagraph = []
  }

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = trimmedLine.match(/^(#{1,4})\s+(.+)$/)

    if (headingMatch) {
      flushParagraph()
      flushList()
      blocks.push({
        id: `heading-${blocks.length}`,
        level: headingMatch[1].length,
        text: headingMatch[2],
        type: 'heading',
      })
      continue
    }

    const listItemMatch = trimmedLine.match(/^[-*]\s+(.+)$/)

    if (listItemMatch) {
      flushParagraph()
      pendingList.push(listItemMatch[1])
      continue
    }

    flushList()
    pendingParagraph.push(trimmedLine)
  }

  flushParagraph()
  flushList()

  return blocks
}

function renderMarkdown(markdown: string) {
  return parseMarkdownBlocks(markdown).map((block) => {
    if (block.type === 'heading') {
      return <h4 key={block.id}>{block.text}</h4>
    }

    if (block.type === 'list') {
      return (
        <ul key={block.id}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    }

    return <p key={block.id}>{block.text}</p>
  })
}

export default function ReleaseNotesDialog({
  bundle,
  onClose,
}: ReleaseNotesDialogProps) {
  return (
    <BottomSheet
      className="release-notes-dialog"
      contentClassName="release-notes-dialog__content"
      description={
        bundle.releases.length === 1
          ? 'Latest app changes ready on this device.'
          : `${bundle.releases.length} release entries are ready on this device.`
      }
      kicker="Updates"
      onClose={onClose}
      title="What changed"
    >
      <div className="release-notes-dialog__stack">
        {bundle.releases.map((release) => (
          <article key={release.id} className="release-notes-dialog__release">
            <div className="release-notes-dialog__release-header">
              <div>
                <p className="kicker">{release.date || 'Release'}</p>
                <h3>{release.title}</h3>
              </div>
              <span className="pill pill--subtle">{release.id}</span>
            </div>
            <div className="release-notes-dialog__markdown">
              {renderMarkdown(release.content)}
            </div>
          </article>
        ))}
      </div>

      <div className="row-actions release-notes-dialog__actions">
        <button type="button" className="primary-button" onClick={onClose}>
          Got it
        </button>
      </div>
    </BottomSheet>
  )
}
