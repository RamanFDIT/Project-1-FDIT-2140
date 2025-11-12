export function createDownloadControls(dom, rows, option, myChart) {
    let downloadMenu = null;
    let downloadTrigger = null;
    let downloadPanel = null;
    let downloadPanelHeader = null;
    let downloadToast = null;
    let downloadToastLabel = null;
    let downloadButtons = [];
    let toastTimeout = null;
  
    // --------------------------
    // PANEL OPEN / CLOSE
    // --------------------------
  
    const openDownloadPanel = () => {
      if (!downloadPanel) return;
      downloadPanel.classList.add('is-open');
      downloadPanel.setAttribute('aria-hidden', 'false');
      downloadMenu.classList.add('is-panel-open');
      downloadTrigger.setAttribute('aria-expanded', 'true');
      downloadTrigger.setAttribute('aria-label', 'Close download menu');
  
      setTimeout(() => {
        downloadButtons[0]?.focus();
      }, 0);
    };
  
    const closeDownloadPanel = () => {
      if (!downloadPanel) return;
      downloadPanel.classList.remove('is-open');
      downloadPanel.setAttribute('aria-hidden', 'true');
      downloadMenu.classList.remove('is-panel-open');
      downloadTrigger.setAttribute('aria-expanded', 'false');
      downloadTrigger.setAttribute('aria-label', 'Download data');
    };
  
    // --------------------------
    // TOAST MESSAGE
    // --------------------------
  
    const showDownloadToast = (message) => {
      if (!downloadToast) return;
  
      downloadToastLabel.textContent = message;
      downloadToast.classList.add('is-visible');
      downloadMenu.classList.add('is-toast');
  
      if (toastTimeout) clearTimeout(toastTimeout);
  
      toastTimeout = setTimeout(() => {
        downloadToast.classList.remove('is-visible');
        downloadMenu.classList.remove('is-toast');
      }, 1800);
    };
  
    // --------------------------
    // DOWNLOAD HELPERS
    // --------------------------
  
    const triggerBlobDownload = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    const triggerDataUrlDownload = (dataUrl, filename) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    // --------------------------
    // PDF EXPORT
    // --------------------------
  
    const generatePdf = () => {
      if (!window.jspdf || !window.jspdf.jsPDF) return false;
  
      const doc = new window.jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });
  
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
  
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.text('Trip Data Table', margin, margin);
  
      const headers = ['Year', ...option.series.map(s => s.name)];
      doc.setFontSize(12);
  
      let y = margin + 25;
  
      headers.forEach((h, i) => {
        doc.text(h, margin + i * 90, y);
      });
  
      y += 20;
  
      rows.forEach(r => {
        const row = [
          r.Year,
          r.Actual + '%',
          r.Female + '%',
          r.Male + '%',
          r['18_to_24_years'] + '%',
          r['25_to_44_years'] + '%',
          r['45_to_64_years'] + '%',
          r['65_years_and_older'] + '%',
        ];
  
        row.forEach((cell, i) => {
          doc.text(String(cell), margin + i * 90, y);
        });
  
        y += 20;
      });
  
      doc.save('trip-data.pdf');
      return true;
    };
  
    // --------------------------
    // PNG EXPORT
    // --------------------------
  
    const downloadChartImage = () => {
      const dataUrl = myChart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
  
      triggerDataUrlDownload(dataUrl, 'trip-data-chart.png');
      return true;
    };
  
    // --------------------------
    // MAIN DOWNLOAD SWITCH
    // --------------------------
  
    const performDownload = (type) => {
      switch (type) {
        case 'csv':
          const csv = Papa.unparse(rows);
          triggerBlobDownload(new Blob([csv], { type: 'text/csv' }), 'trip-data.csv');
          return true;
  
        case 'json':
          triggerBlobDownload(
            new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }),
            'trip-data.json'
          );
          return true;
  
        case 'pdf':
          return generatePdf();
  
        case 'image':
          return downloadChartImage();
  
        default:
          return false;
      }
    };
  
    // --------------------------
    // BUTTON CLICK HANDLER
    // --------------------------
  
    const handleDownloadOption = (event) => {
      event.preventDefault();
      event.stopPropagation();
  
      const type = event.currentTarget.getAttribute('data-download');
      const success = performDownload(type);
  
      closeDownloadPanel();
      showDownloadToast(success ? 'Downloaded!' : 'Error');
    };
  
    const toggleDownloadPanel = (event) => {
      event.stopPropagation();
      downloadPanel.classList.contains('is-open')
        ? closeDownloadPanel()
        : openDownloadPanel();
    };
  
    const handleDownloadOutside = (event) => {
      if (!downloadMenu.contains(event.target)) {
        closeDownloadPanel();
      }
    };
  
    const handleDownloadKeydown = (event) => {
      if (event.key === 'Escape') closeDownloadPanel();
    };
  
    // --------------------------
    // CREATE BUTTON UI
    // --------------------------
  
    const ensureDownloadControl = () => {
      downloadMenu = document.createElement('div');
      downloadMenu.className = 'chart-download';
  
      downloadMenu.innerHTML = `
        <button type="button" class="chart-download-trigger" aria-expanded="false">
          <span class="chart-download-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.75V14.25" stroke="white" stroke-width="2"/>
              <path d="M8.25 10.5L12 14.25L15.75 10.5" stroke="white" stroke-width="2"/>
              <path d="M5.25 18.75H18.75" stroke="white" stroke-width="2"/>
            </svg>
          </span>
          <span class="chart-download-label">Download</span>
        </button>
  
        <div class="chart-download-panel" aria-hidden="true">
          <div class="chart-download-panel-header">Close</div>
  
          <div class="chart-download-option-group">
            <button class="chart-download-option" data-download="csv">CSV</button>
            <button class="chart-download-option" data-download="json">JSON</button>
            <button class="chart-download-option" data-download="pdf">PDF</button>
            <button class="chart-download-option" data-download="image">Image</button>
          </div>
        </div>
  
        <div class="chart-download-toast">
          <span class="chart-download-toast-label">Downloaded!</span>
        </div>
      `;
  
      dom.appendChild(downloadMenu);
  
      downloadTrigger = downloadMenu.querySelector('.chart-download-trigger');
      downloadPanel = downloadMenu.querySelector('.chart-download-panel');
      downloadPanelHeader = downloadMenu.querySelector('.chart-download-panel-header');
      downloadToast = downloadMenu.querySelector('.chart-download-toast');
      downloadToastLabel = downloadMenu.querySelector('.chart-download-toast-label');
      downloadButtons = [...downloadMenu.querySelectorAll('.chart-download-option')];
  
      downloadTrigger.addEventListener('click', toggleDownloadPanel);
      downloadPanelHeader.addEventListener('click', closeDownloadPanel);
      downloadButtons.forEach(btn => btn.addEventListener('click', handleDownloadOption));
      document.addEventListener('click', handleDownloadOutside, true);
      document.addEventListener('keydown', handleDownloadKeydown);
  
      return downloadMenu;
    };
  
    // Initialize
    ensureDownloadControl();
  }