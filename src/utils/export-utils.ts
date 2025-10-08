export function exportResponsesToCSV(
  responses: Array<{
    id: string;
    form_slug: string;
    data: Record<string, any>;
    submitted_at: string;
  }>,
  fields: Array<{
    id: string;
    label: string;
  }>
): string {
  // Create header row
  const headers = ['Submission Date', ...fields.map(f => f.label)];
  const csvRows = [headers];

  // Add data rows
  responses.forEach(response => {
    const row = [
      new Date(response.submitted_at).toLocaleString(),
      ...fields.map(field => response.data[field.label] || '')
    ];
    csvRows.push(row);
  });

  // Convert to CSV format
  return csvRows
    .map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    )
    .join('\n');
}

export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    // Other browsers
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}