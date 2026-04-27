export type ContentManifestEntry = {
  id: string
  bucket: 'exercises' | 'programms'
  label: string
  fileName: string
  group: string
  relativePath: string
  sourceFile: string
}

export type ContentManifest = {
  generatedAt: string
  exercises: ContentManifestEntry[]
  programms: ContentManifestEntry[]
  totals: {
    exerciseFiles: number
    programmFiles: number
  }
}

export function collectContentManifest(rootDir?: string): Promise<ContentManifest>
export function writeContentManifestFiles(rootDir?: string): Promise<ContentManifest>
