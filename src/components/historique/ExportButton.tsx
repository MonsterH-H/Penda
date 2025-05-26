
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  data: any[];
}

export const ExportButton = ({ data }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      const headers = ['Date/Heure', 'Machine', 'Température', 'Pression', 'Vibration', 'Score Risque', 'Statut'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          new Date(row.timestamp).toLocaleString(),
          row.machine,
          row.temperature.toFixed(1),
          row.pressure.toFixed(2),
          row.vibration.toFixed(2),
          row.riskScore.toFixed(0),
          row.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `donnees_industrielles_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: `${data.length} entrées exportées en CSV`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      disabled={isExporting || data.length === 0}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    >
      {isExporting ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Export...</span>
        </div>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </>
      )}
    </Button>
  );
};
