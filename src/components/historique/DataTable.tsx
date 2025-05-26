
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DataTableProps {
  data: any[];
  isLoading: boolean;
}

export const DataTable = ({ data, isLoading }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du tableau...</span>
      </div>
    );
  }

  // Filtrage et tri
  const filteredData = data.filter(item =>
    item.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      normal: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-red-100 text-red-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status === 'normal' ? 'Normal' : status === 'warning' ? 'Attention' : 'Critique'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher par machine ou statut..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {[
                { key: 'timestamp', label: 'Date/Heure' },
                { key: 'machine', label: 'Machine' },
                { key: 'temperature', label: 'Température' },
                { key: 'pressure', label: 'Pression' },
                { key: 'vibration', label: 'Vibration' },
                { key: 'riskScore', label: 'Score Risque' },
                { key: 'status', label: 'Statut' }
              ].map((column) => (
                <th
                  key={column.key}
                  className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-xs text-gray-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(row.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {row.machine}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {row.temperature.toFixed(1)}°C
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {row.pressure.toFixed(2)} bar
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {row.vibration.toFixed(2)} mm/s
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {row.riskScore.toFixed(0)}%
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, sortedData.length)} sur {sortedData.length} entrées
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
