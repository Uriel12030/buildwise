'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  existingFiles?: { file_name: string; file_path: string; file_type: string }[]
  onRemoveExisting?: (filePath: string) => void
  accept?: string
  maxFiles?: number
  className?: string
}

export function FileUploader({
  onFilesSelected,
  existingFiles = [],
  onRemoveExisting,
  accept = 'image/*,.pdf,.doc,.docx',
  maxFiles = 10,
  className,
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const newFiles = Array.from(files).slice(0, maxFiles - selectedFiles.length)
      const updated = [...selectedFiles, ...newFiles]
      setSelectedFiles(updated)
      onFilesSelected(updated)
    },
    [selectedFiles, maxFiles, onFilesSelected]
  )

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updated)
    onFilesSelected(updated)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer',
          dragActive
            ? 'border-brand bg-brand-light scale-[1.01]'
            : 'border-border hover:border-brand/40 hover:bg-muted'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = accept
          input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files)
          input.click()
        }}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          גרור קבצים לכאן או <span className="text-brand font-medium">עיין</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">תמונות, PDF, מסמכים</p>
      </div>

      {/* Existing files */}
      {existingFiles.map((file) => (
        <div
          key={file.file_path}
          className="flex items-center gap-3 rounded-lg border bg-muted px-3 py-2"
        >
          {file.file_type.startsWith('image/') ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-foreground flex-1 truncate">{file.file_name}</span>
          {onRemoveExisting && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveExisting(file.file_path)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}

      {/* New files */}
      {selectedFiles.map((file, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border bg-blue-50 px-3 py-2"
        >
          {file.type.startsWith('image/') ? (
            <ImageIcon className="h-4 w-4 text-blue-400" />
          ) : (
            <FileIcon className="h-4 w-4 text-blue-400" />
          )}
          <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              removeFile(i)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
