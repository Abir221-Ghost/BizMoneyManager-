import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PdfFormat = 'a4' | 'receipt';

export const PdfService = {
  /**
   * Generates a PDF from a specific HTML Element ID.
   * Supports A4 and Receipt (Memo) formats.
   */
  exportToPdf: async (elementId: string, fileName: string, format: PdfFormat = 'a4') => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    // Configuration for sizes
    // Receipt: 80mm width (approx 380px visual width in UI)
    const configs = {
      a4: { pxWidth: 794, mmWidth: 210 },
      receipt: { pxWidth: 380, mmWidth: 80 }
    };
    
    const config = configs[format];

    // Store original styles to revert later
    const originalStyles = {
        boxShadow: element.style.boxShadow,
        transform: element.style.transform,
        margin: element.style.margin
    };

    // Remove effects that might break capture
    element.style.boxShadow = 'none';
    element.style.transform = 'none';
    element.style.margin = '0';

    try {
      const canvas = await html2canvas(element, {
        scale: 4, // Higher scale for better text quality
        useCORS: true,
        backgroundColor: '#ffffff', // Force white background
        logging: false,
        width: element.offsetWidth, // Capture actual width
        windowWidth: 1280
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = config.mmWidth;
      const pageHeight = (canvas.height * imgWidth) / canvas.width;

      // Initialize PDF with dynamic height for receipts
      const pdf = new jsPDF('p', 'mm', format === 'receipt' ? [imgWidth, pageHeight] : 'a4');

      if (format === 'receipt') {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
      } else {
          // A4 Logic with automatic page breaks
          const a4Height = 297;
          let heightLeft = pageHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, pageHeight);
          heightLeft -= a4Height;

          while (heightLeft >= 0) {
            position = heightLeft - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, pageHeight);
            heightLeft -= a4Height;
          }
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert("PDF তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      // Restore styles
      element.style.boxShadow = originalStyles.boxShadow;
      element.style.transform = originalStyles.transform;
      element.style.margin = originalStyles.margin;
    }
  },

  /**
   * Exports HTML element as an Image (PNG)
   */
  exportToImage: async (elementId: string, fileName: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const originalBoxShadow = element.style.boxShadow;
      element.style.boxShadow = 'none'; 

      try {
          const canvas = await html2canvas(element, {
              scale: 4,
              useCORS: true,
              backgroundColor: '#ffffff'
          });
          
          const link = document.createElement('a');
          link.download = fileName;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } catch (error) {
          console.error("Image Export Failed", error);
          alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
      } finally {
          element.style.boxShadow = originalBoxShadow;
      }
  }
};