var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};
let syncFullscreenToolState = () => {};

// Ensure PapaParse is available
if (typeof Papa === 'undefined') {
  console.error('PapaParse is not loaded. Add <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script> to your HTML before index.js.');
}




document.addEventListener('fullscreenchange', () => {
  myChart.resize();
  syncFullscreenToolState();
});

const labelShortNames = {
  'Actual Trips': 'Trips',
  'Female': 'Female',
  'Male': 'Male',
  '18 to 24 years': '18–24',
  '25 to 44 years': '25–44',
  '45 to 64 years': '45–64',
  '65 years and older': '65+'
};

const labelOption = {
  show: true,
  position: 'inside',
  verticalAlign: 'middle',
  align: 'center',
  rotate: 90,
  fontSize: 14,
  fontFamily: 'Montserrat, sans-serif',
  formatter: (p) => {
    if (p.seriesType === 'line') return '';
  
    if (p.value == null || p.value < 12) return '';
  
    return labelShortNames[p.seriesName] || p.seriesName;
  }
};


// Загружаем JSON и строим график
fetch('data.json')
  .then(r => r.json())
  .then(rows => {
    const hiddenLabelOption = { show: false };

    const years = rows.map(r => r.Year);
    const actual = rows.map(r => r.Actual);
    const female = rows.map(r => r.Female);
    const male = rows.map(r => r.Male);
    const age18_24 = rows.map(r => r['18_to_24_years']);
    const age25_44 = rows.map(r => r['25_to_44_years']);
    const age45_64 = rows.map(r => r['45_to_64_years']);
    const age65 = rows.map(r => r['65_years_and_older']);

  let tableOverlay = null;
  let tableVisible = false;
  let toolboxDock = null;
  const toolboxPlacements = [];

  let downloadMenu = null;
  let downloadTrigger = null;
  let downloadPanel = null;
  let downloadPanelHeader = null;
  let downloadToast = null;
  let downloadToastLabel = null;
  let downloadButtons = [];
  let toastTimeout = null;
  let currentMagicType = 'bar';

    const toggleToolActive = (nodes, active) => {
      nodes.forEach(node => node.classList.toggle('tool-active', !!active));
    };

    const setToolActive = (selector, active) => {
      toggleToolActive(dom.querySelectorAll(selector), active);
    };

    const setToolActiveByTitle = (title, active) => {
      const matches = Array.from(dom.querySelectorAll('.echarts-toolbox-feature')).filter(node => node.getAttribute('title') === title);
      toggleToolActive(matches, active);
    };

    const syncMagicTypeTools = () => {
      setToolActiveByTitle('Bar Chart', currentMagicType === 'bar');
      setToolActiveByTitle('Line Chart', currentMagicType === 'line');
    };

    const syncTableTool = () => {
      setToolActive('.echarts-toolbox-feature-myTableView', tableVisible);
    };

    const syncFullscreenTool = () => {
      const isActive = document.fullscreenElement === dom;
      setToolActive('.echarts-toolbox-feature-myFullscreen', isActive);
    };

    const syncToolHighlights = () => {
      syncMagicTypeTools();
      syncTableTool();
      syncFullscreenTool();
    };

    syncFullscreenToolState = syncFullscreenTool;

    const ensureTableOverlay = () => {
      if (!tableOverlay) {
        tableOverlay = document.createElement('div');
        tableOverlay.className = 'table-view-overlay';
        tableOverlay.setAttribute('role', 'region');
        tableOverlay.setAttribute('aria-live', 'polite');
        tableOverlay.style.display = 'none';
        dom.appendChild(tableOverlay);
      }
      return tableOverlay;
    };

    const ensureToolboxDock = () => {
      if (!toolboxDock) {
        toolboxDock = document.createElement('div');
        toolboxDock.className = 'table-view-toolbox-dock';
      }
      return toolboxDock;
    };

    const buildTableMarkup = () => {
      const headerCells = ['<th scope="col">Year</th>']
        .concat(option.series.map(series => `<th scope="col">${series.name}</th>`))
        .join('');

      const rowsHtml = years.map((year, idx) => {
        const cells = option.series
          .map(series => {
            const value = series.data[idx];
            return `<td>${value != null ? `${value}%` : ''}</td>`;
          })
          .join('');
        return `<tr${idx % 2 === 0 ? ' class="row-alt"' : ''}><th scope="row">${year}</th>${cells}</tr>`;
      }).join('');

      return `
        <div class="table-view-container">
          <div class="table-view-header">
            <div>
              <h2>Trip Data Table</h2>
            </div>
            <button type="button" class="table-view-close" aria-label="Close table view">×</button>
          </div>
          <div class="table-view-scroll">
            <table>
              <thead><tr>${headerCells}</tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </div>  
        `;
    };

    const hideTableView = () => {
      const overlay = ensureTableOverlay();

      if (toolboxPlacements.length) {
        toolboxPlacements.forEach(({ element, parent, nextSibling }) => {
          if (!parent) {
            return;
          }
          if (nextSibling && nextSibling.parentNode === parent) {
            parent.insertBefore(element, nextSibling);
          } else {
            parent.appendChild(element);
          }
        });
        toolboxPlacements.length = 0;
      }

      if (toolboxDock) {
        toolboxDock.innerHTML = '';
      }

      overlay.style.display = 'none';
      tableVisible = false;
      syncTableTool();
    };

    const showTableView = () => {
      closeDownloadPanel();
      const overlay = ensureTableOverlay();
      overlay.innerHTML = buildTableMarkup();
      const dock = ensureToolboxDock();
      dock.innerHTML = '';

      toolboxPlacements.length = 0;
      const toolboxElements = Array.from(dom.querySelectorAll('.echarts-toolbox'));
      toolboxElements.forEach(element => {
        toolboxPlacements.push({
          element,
          parent: element.parentNode,
          nextSibling: element.nextSibling
        });
        dock.appendChild(element);
      });

      overlay.appendChild(dock);
      overlay.style.display = 'flex';

      const closeBtn = overlay.querySelector('.table-view-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', hideTableView, { once: true });
      }

      tableVisible = true;
      syncTableTool();
    };

    const toggleTableView = () => {
      if (tableVisible) {
        hideTableView();
      } else {
        showTableView();
      }
    };



    // Download button functionality


    const openDownloadPanel = () => {
      if (!downloadPanel) return;
      downloadPanel.classList.add('is-open');
      downloadPanel.setAttribute('aria-hidden', 'false');
      if (downloadMenu) {
        downloadMenu.classList.add('is-panel-open');
      }
      if (downloadTrigger) {
        downloadTrigger.setAttribute('aria-expanded', 'true');
        downloadTrigger.setAttribute('aria-label', 'Close download menu');
      }
      if (downloadButtons.length) {
        setTimeout(() => {
          downloadButtons[0].focus();
        }, 0);
      }
    };

    const closeDownloadPanel = () => {
      if (!downloadPanel) return;
      downloadPanel.classList.remove('is-open');
      downloadPanel.setAttribute('aria-hidden', 'true');
      if (downloadMenu) {
        downloadMenu.classList.remove('is-panel-open');
      }
      if (downloadTrigger) {
        downloadTrigger.setAttribute('aria-expanded', 'false');
        downloadTrigger.setAttribute('aria-label', 'Download data');
      }
    };

    const showDownloadToast = (message) => {
      if (!downloadToast) return;
      if (downloadToastLabel) {
        downloadToastLabel.textContent = message;
      } else {
        downloadToast.textContent = message;
      }
      downloadToast.classList.add('is-visible');
      if (downloadMenu) {
        downloadMenu.classList.add('is-toast');
      }
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
      toastTimeout = setTimeout(() => {
        downloadToast.classList.remove('is-visible');
        if (downloadMenu) {
          downloadMenu.classList.remove('is-toast');
        }
        if (downloadTrigger) {
          downloadTrigger.setAttribute('aria-label', 'Download data');
          downloadTrigger.blur();
        }
      }, 1800);
    };

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

    const generatePdf = () => {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        console.warn('jsPDF not available, unable to export PDF.');
        return false;
      }

      const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const headerY = margin + 20;
      const headers = ['Year'].concat(option.series.map(series => series.name));
      const columnCount = headers.length;
      const usableWidth = pageWidth - margin * 2;
      const step = columnCount > 1 ? usableWidth / (columnCount - 1) : usableWidth;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.text('Trip Data Table', margin, margin);

      doc.setFontSize(11);
      headers.forEach((header, index) => {
        doc.text(header, margin + step * index, headerY);
      });

      let currentY = headerY + 18;
      doc.setFontSize(10);

      const formattedRows = years.map((year, idx) => {
        const seriesValues = option.series.map(series => {
          const value = series.data[idx];
          return value != null ? `${value}%` : '';
        });
        return [String(year)].concat(seriesValues);
      });

      formattedRows.forEach(row => {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          doc.setFontSize(18);
          doc.text('Trip Data Table (cont.)', margin, margin);
          doc.setFontSize(11);
          headers.forEach((header, index) => {
            doc.text(header, margin + step * index, margin + 20);
          });
          currentY = margin + 38;
          doc.setFontSize(10);
        }

        row.forEach((cell, index) => {
          doc.text(cell || '', margin + step * index, currentY);
        });
        currentY += 16;
      });

      doc.save('trip-data.pdf');
      return true;
    };

    const downloadChartImage = () => {
      const dataUrl = myChart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
      triggerDataUrlDownload(dataUrl, 'trip-data-chart.png');
      return true;
    };

    const performDownload = (type) => {
      switch (type) {
        case 'csv':
          if (typeof Papa !== 'undefined' && typeof Papa.unparse === 'function') {
            const csv = Papa.unparse(rows);
            triggerBlobDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'trip-data.csv');
            return true;
          }
          console.warn('Papa.unparse not available, unable to export CSV.');
          return false;
        case 'json':
          triggerBlobDownload(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8;' }), 'trip-data.json');
          return true;
        case 'pdf':
          return generatePdf();
        case 'image':
          return downloadChartImage();
        default:
          return false;
      }
    };

    const handleDownloadOption = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const type = event.currentTarget.getAttribute('data-download');
      const success = performDownload(type);
      closeDownloadPanel();
      showDownloadToast(success ? 'Downloaded!' : 'Download unavailable');
    };

    const toggleDownloadPanel = (event) => {
      event.stopPropagation();
      if (downloadPanel && downloadPanel.classList.contains('is-open')) {
        closeDownloadPanel();
      } else {
        openDownloadPanel();
      }
    };

    const handleDownloadOutside = (event) => {
      if (!downloadMenu || downloadMenu.contains(event.target)) {
        return;
      }
      closeDownloadPanel();
    };

    const handleDownloadKeydown = (event) => {
      if (event.key === 'Escape') {
        closeDownloadPanel();
      }
    };

    const ensureDownloadControl = () => {
      if (downloadMenu) {
        return downloadMenu;
      }

      downloadMenu = document.createElement('div');
      downloadMenu.className = 'chart-download';
      downloadMenu.innerHTML = `
        <button type="button" class="chart-download-trigger" aria-haspopup="true" aria-expanded="false" aria-label="Download data">
          <span class="chart-download-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3.75V14.25" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8.25 10.5L12 14.25L15.75 10.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5.25 18.75H18.75" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="chart-download-label">Download</span>
        </button>
        <div class="chart-download-panel" role="menu" aria-hidden="true">
          <div class="chart-download-panel-header">
            <span class="chart-close-panel-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 13.4L7.10005 18.3C6.91672 18.4834 6.68338 18.575 6.40005 18.575C6.11672 18.575 5.88338 18.4834 5.70005 18.3C5.51672 18.1167 5.42505 17.8834 5.42505 17.6C5.42505 17.3167 5.51672 17.0834 5.70005 16.9L10.6 12L5.70005 7.10005C5.51672 6.91672 5.42505 6.68338 5.42505 6.40005C5.42505 6.11672 5.51672 5.88338 5.70005 5.70005C5.88338 5.51672 6.11672 5.42505 6.40005 5.42505C6.68338 5.42505 6.91672 5.51672 7.10005 5.70005L12 10.6L16.9 5.70005C17.0834 5.51672 17.3167 5.42505 17.6 5.42505C17.8834 5.42505 18.1167 5.51672 18.3 5.70005C18.4834 5.88338 18.575 6.11672 18.575 6.40005C18.575 6.68338 18.4834 6.91672 18.3 7.10005L13.4 12L18.3 16.9C18.4834 17.0834 18.575 17.3167 18.575 17.6C18.575 17.8834 18.4834 18.1167 18.3 18.3C18.1167 18.4834 17.8834 18.575 17.6 18.575C17.3167 18.575 17.0834 18.4834 16.9 18.3L12 13.4Z" fill="white"/>
              </svg>
            </span>
            <span class="chart-download-panel-title">Close</span>
          </div>
          <div class="chart-download-option-group" role="group">
            <button type="button" class="chart-download-option" data-download="csv" role="menuitem">
              <span class="chart-download-option-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3.75H14L18.25 8V20.25H7V3.75Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 3.75V8H18.25" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9 12H16" stroke="white" stroke-width="1.4" stroke-linecap="round" />
                  <path d="M9 15H16" stroke="white" stroke-width="1.4" stroke-linecap="round" />
                </svg>
              </span>
              <span class="chart-download-option-label">CSV</span>
            </button>
            <button type="button" class="chart-download-option" data-download="json" role="menuitem">
              <span class="chart-download-option-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 7C7.12 7 6 8.12 6 9.5V10.5C6 11.88 7.12 13 8.5 13V13C7.12 13 6 14.12 6 15.5V16.5C6 17.88 7.12 19 8.5 19" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M15.5 7C16.88 7 18 8.12 18 9.5V10.5C18 11.88 16.88 13 15.5 13V13C16.88 13 18 14.12 18 15.5V16.5C18 17.88 16.88 19 15.5 19" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="chart-download-option-label">JSON</span>
            </button>
            <button type="button" class="chart-download-option" data-download="pdf" role="menuitem">
              <span class="chart-download-option-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3.75H14L18.25 8V20.25H7V3.75Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14 3.75V8H18.25" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9.75 13.5H11.5C12.36 13.5 13.06 14.19 13.06 15.06C13.06 15.93 12.36 16.63 11.5 16.63H9.75V13.5Z" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M13.75 13.5H15.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M13.75 16.75H15.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="chart-download-option-label">PDF</span>
            </button>
            <button type="button" class="chart-download-option" data-download="image" role="menuitem">
              <span class="chart-download-option-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.75 6.75H19.25V19.25H4.75V6.75Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M8.75 11.5C9.41 11.5 9.95 10.96 9.95 10.3C9.95 9.64 9.41 9.1 8.75 9.1C8.09 9.1 7.55 9.64 7.55 10.3C7.55 10.96 8.09 11.5 8.75 11.5Z" fill="white" />
                  <path d="M19.25 15.5L15.5 11.75L9.75 17.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="chart-download-option-label">Image</span>
            </button>
          </div>
        </div>
        <div class="chart-download-toast" role="status" aria-live="polite">
          <span class="chart-download-toast-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8.75 12.25L11.25 14.75L15.25 9.75" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="chart-download-toast-label">Downloaded!</span>
        </div>
      `;

      dom.appendChild(downloadMenu);

      downloadTrigger = downloadMenu.querySelector('.chart-download-trigger');
      downloadPanel = downloadMenu.querySelector('.chart-download-panel');
      downloadPanelHeader = downloadMenu.querySelector('.chart-download-panel-header');
      downloadToast = downloadMenu.querySelector('.chart-download-toast');
      downloadToastLabel = downloadMenu.querySelector('.chart-download-toast-label');
      downloadButtons = Array.from(downloadMenu.querySelectorAll('.chart-download-option'));

      if (downloadTrigger) {
        downloadTrigger.addEventListener('click', toggleDownloadPanel);
      }
      const handlePanelCloseActivation = (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeDownloadPanel();
        if (!downloadTrigger) {
          return;
        }
        const isKeyboard = event.type === 'keydown' || (event.type === 'click' && event.detail === 0);
        if (isKeyboard) {
          downloadTrigger.focus();
        } else {
          downloadTrigger.blur();
          requestAnimationFrame(() => downloadTrigger.blur());
        }
      };
      if (downloadPanelHeader) {
        downloadPanelHeader.setAttribute('role', 'button');
        downloadPanelHeader.setAttribute('tabindex', '0');
        downloadPanelHeader.setAttribute('aria-label', 'Close download menu');
        downloadPanelHeader.addEventListener('click', handlePanelCloseActivation);
        downloadPanelHeader.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.key === 'Escape') {
            handlePanelCloseActivation(event);
          }
        });
      }
      downloadButtons.forEach(btn => btn.addEventListener('click', handleDownloadOption));
      document.addEventListener('click', handleDownloadOutside, true);
      document.addEventListener('keydown', handleDownloadKeydown);

      return downloadMenu;
    };

    ensureDownloadControl();


    // download button functionality - end

    const option = {
      backgroundColor: '#ffffff',
      textStyle: {
        fontFamily: 'Montserrat, sans-serif',
        color: '#333333'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => `${v}%`,
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 'medium'
        }
      },
      legend: {
        data: [
          'Actual Trips','Female','Male','18 to 24 years','25 to 44 years','45 to 64 years','65 years and older'],
        selected: {
          '18 to 24 years': false,
          '25 to 44 years': false,
          '45 to 64 years': false,
          '65 years and older': false
        },
        textStyle: {
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          color: '#333333' // legend text color 2nd variant (have to change series later as well)  
        },
        itemGap: 20,
        inactiveColor: '#cccccc',      // innactive legend item color

      },
      
      toolbox: [
        {
          // GROUP 1: Chart Type Controls (positioned higher)
          show: true,
          orient: 'vertical',
          left: 'right',
          top: '30%',
          right: '2%',
          iconStyle: {
            borderWidth: 1
          },
          emphasis: {
            iconStyle: {
              borderWidth: 1
            }
          },
          itemSize: 20,
          itemGap: 8,
          feature: {
            magicType: { 
              show: true, 
              type: ['bar', 'line'],
              title: {
                bar: 'Bar Chart',
                line: 'Line Chart'
              }
            },
            myTableView: {
              show: true,
              title: 'Table View',
              icon: 'path://M64 96h384v64H64V96zm0 96h384v64H64v-64zm0 96h384v64H64v-64z',
              onclick: toggleTableView
            }
          }
        },
        {
          // GROUP 2: Utility Controls (positioned lower with gap)
          show: true,
          orient: 'vertical',
          left: 'right',
          top: '55%',
          right: '2%',
          iconStyle: {
            borderWidth: 1
          },
          emphasis: {
            iconStyle: {
              borderWidth: 1
            }
          },
          itemSize: 20,
          itemGap: 8,
          feature: {
            restore: { 
              show: true,
              title: 'Reset'
            },
            
            myFullscreen: {
              show: true,
              title: 'Fullscreen',
              icon: 'path://M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z',
              onclick: function () {
                const chartDom = document.getElementById('chart-container');
                if (!document.fullscreenElement) {
                  chartDom.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }
            }
          }
        }
      ],

      grid: {
        left: 20,
        top: 100,
        bottom: 120,
        width: '85%',
        containLabel: true
      },

      dataZoom: [
        {
          type: 'inside',   // зум мышкой внутри графика
          start: 0,         
          end: 100          
        },
        {
          type: 'slider',   // ползунок под графиком
          start: 0,
          end: 100,
          top: '2%',
        }
      ],

      xAxis: [{ 
        type: 'category', 
        data: years,
        axisLabel: {
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16
        }
      }],
      yAxis: [{ 
        type: 'value', 
        min: 0, 
        max: 100, 
        interval: 20, 
        minorTick: {
          show: true,   // включить промежуточные маленькие деления
          splitNumber: 1 // количество "мелких" делений между крупными
        },
        minorSplitLine: {
          show: true,
          lineStyle: { color: 'red',width: 4, type: 'dashed' } // стиль мелких линий
        },
        axisLabel: { 
          formatter: '{value}%',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16
        }
      }],


series: [
  { name: 'Actual Trips', type: 'bar', data: actual, label: labelOption, symbol: 'rect', lineStyle: { width: 4 },  }, //itemStyle: {color: '#EB170B'}, second variant of changing a color
  { name: 'Female', type: 'bar', data: female, label: labelOption, symbol: 'roundRect', symbolSize: 5, }, // label: {...labelOption, color:'#eb170b'} change a color for a text 
  { name: 'Male', type: 'bar', data: male, label: labelOption, symbol: 'roundRect', symbolSize: 5, },
  { name: '18 to 24 years', type: 'bar', data: age18_24, label: labelOption , symbol: 'roundRect', symbolSize: 5, },
  { name: '25 to 44 years', type: 'bar', data: age25_44, label: labelOption , symbol: 'roundRect', symbolSize: 5,},
  { name: '45 to 64 years', type: 'bar', data: age45_64, label: labelOption , symbol: 'roundRect', symbolSize: 5,},
  { name: '65 years and older', type: 'bar', data: age65, label: labelOption, symbol: 'roundRect', symbolSize: 5, }
]
    };

    myChart.setOption(option);

    myChart.on('magicTypeChanged', () => {
      if (tableVisible) hideTableView();
    });

    myChart.on('restore', () => {
      if (tableVisible) hideTableView();
    });
  });


window.addEventListener('resize', myChart.resize);