// frontend/src/components/URLTable.tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { UrlData } from '../types';
import URLTableRow from './URLTableRow';

interface URLTableProps {
  data: UrlData[];
  selectedIds: number[];
  onAnalyze: (id: number) => void;
  onDelete: (id: number) => void;
  onSelect: (id: number, checked: boolean) => void;
}

const URLTable: React.FC<URLTableProps> = ({
  data,
  selectedIds,
  onAnalyze,
  onDelete,
  onSelect
}) => {
  // Create a ref for the list to access list methods
  const listRef = useRef<List>(null);

  // Memoize row data to prevent unnecessary re-renders
  const rowData = useMemo(() => data, [data]);

  // Calculate dynamic row heights based on content
  const getRowHeight = useCallback((index: number) => {
    const item = rowData[index];
    // Base height
    let height = 50;
    
    // Increase height if URL is long
    if (item.url.length > 50) height += 20;
    
    // Increase height if title exists
    if (item.title) height += 20;
    
    return height;
  }, [rowData]);

  // Clear row height cache when data changes
  const handleDataChange = useCallback(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);

  // Memoize the row renderer to prevent unnecessary recreations
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rowData[index];
    return (
      <div style={style}>
        <URLTableRow
          row={row}
          onAnalyze={onAnalyze}
          onDelete={onDelete}
          isSelected={selectedIds.includes(row.id)}
          onSelect={onSelect}
        />
      </div>
    );
  }, [rowData, onAnalyze, onDelete, selectedIds, onSelect]);

  // Recalculate row heights when data changes
  React.useEffect(() => {
    handleDataChange();
  }, [rowData, handleDataChange]);

  return (
    <div style={{ 
      height: '80vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={rowData.length}
            itemSize={getRowHeight}
            overscanCount={10} // Render 10 items outside viewport for smoother scrolling
            estimatedItemSize={60} // Helps with initial render performance
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default URLTable;
