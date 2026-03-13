"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UploadPrescriptionDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    toast({
      title: "Prescription Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    })
    setOpen(false)
    setFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          Choose File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Prescription</DialogTitle>
          <DialogDescription>
            Upload a photo or scan of your prescription to find local pharmacies.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors hover:bg-muted/50 cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <File className="h-10 w-10 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Click or drag file to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG, PDF (Max 5MB)
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file}>
            Upload & Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
