import { useState } from 'react';
import { Upload } from 'lucide-react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function UploadsAdmin() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    fileId: string;
    publicUrl: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Replace with your actual backend upload endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/storage/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadResult(data);
      toast.success('File uploaded successfully');
      setFile(null);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="mb-2">Upload Files</h1>
        <p className="text-muted-foreground">
          Upload images to Backblaze via backend
        </p>
      </div>

      <div className="premium-card compact max-w-2xl">
        <div className="space-y-6">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            size="lg"
            className="w-full"
          >
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>

          {uploadResult && (
            <div className="mt-6 p-4 bg-muted rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Upload Successful</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">File ID:</span>{' '}
                  <code className="bg-background px-2 py-1 rounded">
                    {uploadResult.fileId}
                  </code>
                </p>
                <p>
                  <span className="font-medium">Public URL:</span>{' '}
                  <a
                    href={uploadResult.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {uploadResult.publicUrl}
                  </a>
                </p>
              </div>
              {uploadResult.publicUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <div className="mt-4">
                  <img
                    src={uploadResult.publicUrl}
                    alt="Uploaded"
                    className="max-w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
