import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string = 'report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportTableToPDF = (
  title: string,
  headers: string[],
  data: string[][],
  filename: string = 'report.pdf'
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(16);
  pdf.text(title, 14, 20);
  
  // Add date
  pdf.setFontSize(10);
  pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
  
  // Calculate column widths
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth - (margin * 2);
  const colCount = headers.length;
  const colWidth = usableWidth / colCount;
  
  let y = 40;
  const rowHeight = 8;
  
  // Add headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  headers.forEach((header, index) => {
    pdf.text(header, margin + (index * colWidth), y);
  });
  
  y += rowHeight;
  
  // Add data rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  data.forEach((row) => {
    // Check if we need a new page
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
      
      // Re-add headers on new page
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, margin + (index * colWidth), y);
      });
      pdf.setFont('helvetica', 'normal');
      y += rowHeight;
    }
    
    row.forEach((cell, index) => {
      const text = String(cell).substring(0, 30); // Limit text length
      pdf.text(text, margin + (index * colWidth), y);
    });
    y += rowHeight;
  });
  
  pdf.save(filename);
};

