/**
 * Composant pour l'importation de donnu00e9es ru00e9elles
 */

import { useState } from 'react';
import { Upload, FileType, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataImportUtils, ImportResult } from '@/utils/data/importUtils';
import { TimestampedSensorData } from '@/api/sensorDataService';
import { useData } from '@/contexts/DataContext';

/**
 * Props pour le composant DataImportForm
 */
interface DataImportFormProps {
  onImportComplete?: (result: ImportResult) => void;
  onTrainComplete?: (result: ImportResult) => void;
}

/**
 * Composant pour l'importation de donnu00e9es ru00e9elles
 */
export const DataImportForm = ({ onImportComplete, onTrainComplete }: DataImportFormProps) => {
  // u00c9tat local
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<TimestampedSensorData[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
  // Contexte de donnu00e9es
  const { trainModel } = useData();
  
  // Gu00e9rer la su00e9lection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setImportResult(null);
    }
  };
  
  // Importer les donnu00e9es
  const handleImport = async () => {
    if (!selectedFile) return;
    
    try {
      setIsImporting(true);
      
      // Importer les donnu00e9es
      const result = await DataImportUtils.importDataFromFile(selectedFile);
      setImportResult(result);
      
      if (result.success && result.data) {
        setImportedData(result.data);
      }
      
      // Appeler le callback si fourni
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setImportResult({
        success: false,
        message: `Erreur lors de l'importation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Entrau00eener le modu00e8le avec les donnu00e9es importu00e9es
  const handleTrain = async () => {
    if (importedData.length === 0) return;
    
    try {
      setIsTraining(true);
      setTrainingProgress(0);
      
      // Entrau00eener le modu00e8le
      await trainModel(importedData);
      
      const result: ImportResult = {
        success: true,
        message: 'Modu00e8le entrau00eenu00e9 avec succu00e8s.',
      };
      
      // Appeler le callback si fourni
      if (onTrainComplete) {
        onTrainComplete(result);
      }
    } catch (error) {
      console.error('Erreur lors de l\'entrau00eenement:', error);
      const result: ImportResult = {
        success: false,
        message: `Erreur lors de l'entrau00eenement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        error: error instanceof Error ? error : new Error('Erreur inconnue'),
      };
      
      // Appeler le callback si fourni
      if (onTrainComplete) {
        onTrainComplete(result);
      }
    } finally {
      setIsTraining(false);
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-200/50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Importation de Donnu00e9es Ru00e9elles</h3>
      
      <div className="space-y-6">
        {/* Su00e9lection de fichier */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Su00e9lectionner un fichier CSV ou JSON
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100">
                <Upload className="w-4 h-4 mr-2 text-gray-500" />
                {selectedFile ? selectedFile.name : 'Choisir un fichier'}
              </div>
            </div>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importation...
                </>
              ) : 'Importer'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Formats acceptu00e9s: CSV, JSON. Taille max: 10 MB.
          </p>
        </div>
        
        {/* Ru00e9sultat de l'importation */}
        {importResult && (
          <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <div className="flex items-start">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{importResult.success ? 'Importation ru00e9ussie' : 'Erreur d\'importation'}</p>
                <p className="text-sm">{importResult.message}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Entrau00eenement du modu00e8le */}
        {importedData.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Entrau00eener le modu00e8le avec ces donnu00e9es</h4>
              <Button
                onClick={handleTrain}
                disabled={isTraining}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Entrau00eenement...
                  </>
                ) : 'Entrau00eener'}
              </Button>
            </div>
            
            {/* Barre de progression */}
            {isTraining && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">
                  Progression: {trainingProgress.toFixed(0)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
