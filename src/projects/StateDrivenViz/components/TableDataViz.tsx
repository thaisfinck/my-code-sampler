import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type Row,
} from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import type { Category, DataPoint } from '../types/dataVizTypes';
import {
  fetchDataset,
  updateDataPoint,
  regenerateDataset,
} from '../api/dataApi';
import type { UpdateDataPointInput } from '../api/dataApi';
import '../styles/stateDrivenViz.css';
import { DEFAULT_COLORS } from '../styles/defaultColors';

const queryClient = new QueryClient();

const columnHelper = createColumnHelper<DataPoint>();

const TableInner = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, dataUpdatedAt } = useQuery<
    DataPoint[]
  >({
    queryKey: ['dataset', { source: 'state-driven-viz', count: 20 }],
    queryFn: () => fetchDataset({ count: 20, seed: 1 }),
  });

  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    () => new Set<Category>(['A', 'B', 'C'])
  );
  const [minValue, setMinValue] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortByValueAsc, setSortByValueAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [editingValue, setEditingValue] = useState<string>('');

  const toggleCategory = (category: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleMinValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(next)) return;
    setMinValue(next);
  };

  const handleRowClick = (row: Row<DataPoint>) => {
    setSelectedId(row.original.id);
    const editingValue = row.original.value.toString();
    setEditingValue(editingValue);
  };

  const updateMutation = useMutation({
    mutationFn: (input: UpdateDataPointInput) => updateDataPoint(input),
    onSuccess: (updated) => {
      queryClient.setQueryData<DataPoint[] | undefined>(
        ['dataset', { source: 'state-driven-viz' }],
        (prev) =>
          prev?.map((row) => (row.id === updated.id ? updated : row)) ?? prev
      );
      setEditingValue(updated.value.toString());
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (count: number) => regenerateDataset({ count }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dataset', { source: 'state-driven-viz' }],
      });
    },
  });

  const selectedRow = useMemo(() => {
    if (!selectedId || !data) return null;
    return data.find((row) => row.id === selectedId) ?? null;
  }, [selectedId, data]);

  const handleUpdateValue = () => {
    if (!selectedId || !editingValue) return;
    const numValue = Number.parseFloat(editingValue);
    console.log('Updating value to', numValue);
    console.log('Selected ID:', selectedId);
    if (Number.isNaN(numValue)) return;
    updateMutation.mutate({ id: selectedId, value: numValue });
  };

  const handleUpdateCategory = (category: Category) => {
    if (!selectedId) return;
    updateMutation.mutate({ id: selectedId, category });
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (row) => activeCategories.has(row.category) && row.value >= minValue
    );
  }, [data, activeCategories, minValue]);

  const sortedData = useMemo(() => {
    const copy = [...filteredData];
    copy.sort((a, b) =>
      sortByValueAsc ? a.value - b.value : b.value - a.value
    );
    return copy;
  }, [filteredData, sortByValueAsc]);

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = { A: 0, B: 0, C: 0 };
    sortedData.forEach((row) => {
      counts[row.category] += 1;
    });
    return counts;
  }, [sortedData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('x', {
        header: 'X',
        cell: (info) => info.getValue().toFixed(1),
      }),
      columnHelper.accessor('y', {
        header: 'Y',
        cell: (info) => info.getValue().toFixed(1),
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        cell: (info) => info.getValue().toFixed(1),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => info.getValue(),
      }),
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="project-loading">Loading dataset…</div>;
  }

  if (isError) {
    return (
      <div className="project-error">
        Error loading dataset:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="tdv-table-wrapper">
      <div className="project-controls">
        <div className="project-control-row">
          <span className="project-label">Categories:</span>
          <div className="project-buttons-wrapper">
            {(['A', 'B', 'C'] as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  activeCategories.has(cat)
                    ? 'project-checkbox-button active'
                    : 'project-checkbox-button'
                }
                onClick={() => toggleCategory(cat)}
              >
                <span
                  className="project-checkbox-dot"
                  style={{ backgroundColor: DEFAULT_COLORS[cat] }}
                />
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="project-control-row">
          <span className="project-label">Min value:</span>
          <div className="project-range">
            <input
              type="range"
              min={10}
              max={100}
              value={minValue}
              onChange={handleMinValueChange}
            />
            <span>{minValue}</span>
          </div>
        </div>

        <div className="project-control-row">
          <span className="project-label">Sort by value:</span>
          <div className="project-buttons-wrapper">
            <button
              type="button"
              className={
                sortByValueAsc
                  ? 'project-checkbox-button active'
                  : 'project-checkbox-button'
              }
              onClick={() => setSortByValueAsc(true)}
            >
              Asc
            </button>
            <button
              type="button"
              className={
                !sortByValueAsc
                  ? 'project-checkbox-button active'
                  : 'project-checkbox-button'
              }
              onClick={() => setSortByValueAsc(false)}
            >
              Desc
            </button>
          </div>
        </div>
        <div className="project-control-row">
          <span className="project-label">View:</span>
          <div className="project-buttons-wrapper">
            <button
              type="button"
              className={
                viewMode === 'table'
                  ? 'project-checkbox-button active'
                  : 'project-checkbox-button'
              }
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              type="button"
              className={
                viewMode === 'chart'
                  ? 'project-checkbox-button active'
                  : 'project-checkbox-button'
              }
              onClick={() => setViewMode('chart')}
            >
              Chart
            </button>
          </div>
        </div>
        {selectedRow && (
          <div className="edit-row">
            <span className="project-label">Edit row:</span>
            <div className="tdv-edit-panel">
              <div>
                <div className="buttons-wrapper">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="New value"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    disabled={updateMutation.isPending}
                    className="tdv-input"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateValue}
                    disabled={updateMutation.isPending || !editingValue}
                    className="project-checkbox-button"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update'}
                  </button>
                </div>
                <div className="buttons-wrapper">
                  {(['A', 'B', 'C'] as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleUpdateCategory(cat)}
                      disabled={updateMutation.isPending}
                      className={
                        selectedRow.category === cat
                          ? 'project-checkbox-button active'
                          : 'project-checkbox-button'
                      }
                    >
                      Set {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="close-edit-wrapper"
                onClick={() => setSelectedId(null)}
              >
                x
              </div>
            </div>
          </div>
        )}
        {updateMutation.isError && (
          <div className="project-error">
            Error updating:{' '}
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Unknown error'}
          </div>
        )}

        <div
          className="project-control-row"
          style={{ justifyContent: 'space-between' }}
        >
          <button
            type="button"
            className="project-checkbox-button"
            onClick={() => regenerateMutation.mutate(20)}
            disabled={regenerateMutation.isPending || isLoading}
          >
            {regenerateMutation.isPending ? 'Regenerating…' : 'Regenerate data'}
          </button>
          {dataUpdatedAt && (
            <span className="project-hint">
              Last updated:{' '}
              {new Date(dataUpdatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
      {!sortedData || sortedData.length === 0 ? (
        <div className="tdv-empty">No data available</div>
      ) : viewMode === 'table' ? (
        <table className="tdv-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.original.id === selectedId ? 'is-selected' : ''}
                onClick={() => {
                  handleRowClick(row);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="tdv-chart-wrapper">
          <svg viewBox="0 0 120 80" className="tdv-chart">
            {(['A', 'B', 'C'] as Category[]).map((cat, index) => {
              const count = categoryCounts[cat];
              const maxCount = Math.max(
                categoryCounts.A,
                categoryCounts.B,
                categoryCounts.C
              );
              const barHeight = maxCount ? (count / maxCount) * 60 : 0;
              const x = 20 + index * 30;
              const y = 70 - barHeight;

              return (
                <g key={cat}>
                  <rect
                    x={x}
                    y={y}
                    width={16}
                    height={barHeight}
                    rx={2}
                    className="tdv-chart-bar"
                    style={{ fill: DEFAULT_COLORS[cat] }}
                  />
                  <text
                    x={x + 8}
                    y={77}
                    textAnchor="middle"
                    className="tdv-chart label"
                  >
                    {cat}
                  </text>
                  <text
                    x={x + 8}
                    y={y - 2}
                    textAnchor="middle"
                    className="tdv-chart value"
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

const TableDataViz = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TableInner />
    </QueryClientProvider>
  );
};

export default TableDataViz;
