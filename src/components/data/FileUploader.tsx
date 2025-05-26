import React from 'react';
import { FileUp, FileType, Database, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  uploadedFiles: {name: string, size: number, date: Date, type: string}[];
  onDeleteFile: (fileName: string) => void;
}

export const FileUploader = ({ onFileUpload, uploadedFiles, onDeleteFile }: FileUploaderProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="file-upload">Fichier de données (CSV ou JSON)</Label>
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
          <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">CSV ou JSON (max. 10MB)</p>
            </div>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".csv,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
            />
          </label>
        </div>
      </div>
      
      {/* Fichiers téléversés */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Fichiers téléversés</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {file.type === 'csv' ? (
                      <FileType className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Database className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDeleteFile(file.name)}
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
