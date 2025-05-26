import React, { useState } from 'react';
import { useMLModel } from '@/contexts/MLModelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileType, Check, AlertTriangle } from 'lucide-react';

interface ColumnMapping {
  temperature: string;
  pressure: string;
  vibration: string;
  rotation: string;
  current: string;
  voltage: string;
}

export const DataUploader = () => {
  const { trainModel, predict } = useMLModel();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    temperature: '',
    pressure: '',
    vibration: '',
    rotation: '',
    current: '',
    voltage: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        setColumns(headers);
        
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          data.push(row);
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData.slice(0, 5) : [jsonData];
        
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        }
      }
      
      setPreviewData(data);

      // Auto-map columns if possible
      const newMapping = { ...mapping };
      const lowerColumns = columns.map(c => c.toLowerCase());
      
      if (lowerColumns.includes('temperature') || lowerColumns.includes('temp')) {
        newMapping.temperature = columns[lowerColumns.findIndex(c => c === 'temperature' || c === 'temp')];
      }
      
      if (lowerColumns.includes('pressure') || lowerColumns.includes('press')) {
        newMapping.pressure = columns[lowerColumns.findIndex(c => c === 'pressure' || c === 'press')];
      }
      
      if (lowerColumns.includes('vibration') || lowerColumns.includes('vib')) {
        newMapping.vibration = columns[lowerColumns.findIndex(c => c === 'vibration' || c === 'vib')];
      }
      
      if (lowerColumns.includes('rotation') || lowerColumns.includes('rot') || lowerColumns.includes('rpm')) {
        newMapping.rotation = columns[lowerColumns.findIndex(c => c === 'rotation' || c === 'rot' || c === 'rpm')];
      }
      
      if (lowerColumns.includes('current') || lowerColumns.includes('amp')) {
        newMapping.current = columns[lowerColumns.findIndex(c => c === 'current' || c === 'amp')];
      }
      
      if (lowerColumns.includes('voltage') || lowerColumns.includes('volt')) {
        newMapping.voltage = columns[lowerColumns.findIndex(c => c === 'voltage' || c === 'volt')];
      }
      
      setMapping(newMapping);
      
      toast({
        title: "Fichier chargé",
        description: `${data.length} lignes analysées pour prévisualisation`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier. Vérifiez le format.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProcessData = async () => {
    if (!file || !previewData.length) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord téléverser un fichier de données",
        variant: "destructive"
      });
      return;
    }

    // Check if all required fields are mapped
    const unmappedFields = Object.entries(mapping)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (unmappedFields.length > 0) {
      toast({
        title: "Mappages incomplets",
        description: `Veuillez associer des colonnes pour: ${unmappedFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse full CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          data.push(row);
        }
      } else if (file.name.endsWith('.json')) {
        // Parse full JSON
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      }

      // Transform data according to mapping
      const trainingData = data.map(row => [
        parseFloat(row[mapping.temperature]),
        parseFloat(row[mapping.pressure]),
        parseFloat(row[mapping.vibration]),
        parseFloat(row[mapping.rotation]),
        parseFloat(row[mapping.current]),
        parseFloat(row[mapping.voltage])
      ]);

      // Filter out rows with NaN values
      const validData = trainingData.filter(row => !row.some(isNaN));

      if (validData.length === 0) {
        throw new Error("Aucune donnée valide après conversion");
      }

      // Train model with the data
      await trainModel(validData);

      toast({
        title: "Traitement terminé",
        description: `Modèle entraîné avec ${validData.length} lignes de données valides`,
      });

      // Make a prediction with the first row as an example
      await predict(validData[0]);
    } catch (error) {
      console.error('Error processing data:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du traitement des données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-500" />
          <span>Téléversement de données</span>
        </CardTitle>
        <CardDescription>
          Importez vos données pour entraîner le modèle et faire des prédictions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Fichier de données (CSV ou JSON)</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="file-upload" 
              type="file" 
              accept=".csv,.json" 
              onChange={handleFileChange} 
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              size="icon" 
              disabled={!file || isLoading}
              onClick={() => {
                setFile(null);
                setPreviewData([]);
                setColumns([]);
              }}
            >
              <FileType className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Formats supportés: CSV, JSON</p>
        </div>

        {/* Data preview */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Aperçu des données</h3>
            <div className="overflow-auto max-h-40 border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, i) => (
                      <th 
                        key={i} 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      {columns.map((column, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Column mapping */}
        {columns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Mappage des colonnes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(mapping).map(([field, value]) => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={`mapping-${field}`} className="capitalize">{field}</Label>
                  <Select 
                    value={value} 
                    onValueChange={(val) => handleMappingChange(field as keyof ColumnMapping, val)}
                  >
                    <SelectTrigger id={`mapping-${field}`}>
                      <SelectValue placeholder="Sélectionner une colonne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Aucune --</SelectItem>
                      {columns.map((column) => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleProcessData} 
          disabled={!file || isLoading || previewData.length === 0} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Traitement en cours...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Traiter les données
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
