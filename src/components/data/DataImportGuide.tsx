/**
 * Composant pour afficher un guide d'importation de données
 */

import { Info, FileType, CheckCircle } from 'lucide-react';

/**
 * Props pour le composant DataImportGuide
 */
interface DataImportGuideProps {
  className?: string;
}

/**
 * Composant qui affiche un guide détaillé pour l'importation de données
 */
export const DataImportGuide = ({ className = '' }: DataImportGuideProps) => {
  return (
    <div className={`bg-blue-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <h3 className="font-medium text-blue-800">Guide d'importation de données</h3>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700">Formats de fichiers acceptés</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <FileType className="h-4 w-4 text-blue-600" />
                <span>CSV (.csv)</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileType className="h-4 w-4 text-blue-600" />
                <span>JSON (.json)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700">Champs de données</h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Champs recommandés (non obligatoires):</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>
                  <span className="font-medium">timestamp</span> - Date et heure de la mesure
                  <ul className="list-disc pl-5 text-blue-600 mt-1">
                    <li>Alternatives: <code className="bg-blue-100 px-1 rounded">time</code>, <code className="bg-blue-100 px-1 rounded">date</code></li>
                    <li>Si absent: généré automatiquement</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium">machine</span> - Identifiant de la machine
                  <ul className="list-disc pl-5 text-blue-600 mt-1">
                    <li>Alternatives: <code className="bg-blue-100 px-1 rounded">machineId</code>, <code className="bg-blue-100 px-1 rounded">device</code>, <code className="bg-blue-100 px-1 rounded">equipment</code></li>
                    <li>Si absent: valeur par défaut utilisée</li>
                  </ul>
                </li>
              </ul>
              
              <p className="font-medium mt-2">Champs obligatoires:</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li><span className="font-medium">temperature</span> - Température en degrés Celsius</li>
                <li><span className="font-medium">pressure</span> - Pression en bars</li>
                <li><span className="font-medium">vibration</span> - Vibration en mm/s</li>
              </ul>
              
              <p className="font-medium mt-2">Champs optionnels:</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li><span className="font-medium">rotation</span> - Vitesse de rotation en RPM</li>
                <li><span className="font-medium">current</span> - Courant électrique en ampères</li>
                <li><span className="font-medium">voltage</span> - Tension électrique en volts</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700">Conseils pour une importation réussie</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Assurez-vous que vos données numériques sont valides (pas de texte dans les champs numériques)</li>
              <li>Pour les fichiers CSV, utilisez la virgule (,) comme séparateur</li>
              <li>Pour les fichiers JSON, utilisez un tableau d'objets avec les champs mentionnés ci-dessus</li>
              <li>Si vous avez des colonnes avec des noms différents, utilisez l'outil de mappage après l'importation</li>
            </ul>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-700 mt-0.5" />
              <p className="text-sm text-blue-800">
                Si certains champs sont manquants, le système tentera de les compléter automatiquement lorsque possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};