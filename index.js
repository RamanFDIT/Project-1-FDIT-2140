var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};

// Ensure PapaParse is available
if (typeof Papa === 'undefined') {
  console.error('PapaParse is not loaded. Add <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script> to your HTML before index.js.');
}




// Перерисовка графика при изменении размера экрана / выходе из fullscreen
document.addEventListener('fullscreenchange', () => {
  myChart.resize();
});
// общий label для всех серий:
// на bar — показывает проценты;
// на line — возвращает пустую строку (ничего не рисует).
const labelOption = {
  show: true,
  position: 'inside',
  verticalAlign: 'middle',
  align: 'center',
  rotate: 90,
  fontSize: 12,
  formatter: (p) => (
    p.seriesType === 'line'
      ? '' // ← hiding label for linegraph 
      : (p.value == null ? '' : `  ${p.seriesName}`)//${p.value}%
  )
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

    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => `${v}%`
      },
      legend: {
        data: ['Actual Trips','Female','Male','18 to 24 years','25 to 44 years','45 to 64 years','65 years and older'],
        // top: '3%',
        selected: {
          '18 to 24 years': false,
          '25 to 44 years': false,
          '45 to 64 years': false,
          '65 years and older': false
        }
      },
      
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          dataView: {
            show: true,
            readOnly: true,
            optionToContent: function (opt) {
              // Собираем таблицу данных
              const axisData = opt.xAxis[0].data;
              let table = '<table border="1" style="width:80%;text-align:center;margin:auto;"><tr><th>Year</th>';
      
              opt.series.forEach(s => {
                table += '<th>' + s.name + '</th>';
              });
              table += '</tr>';
      
              for (let i = 0; i < axisData.length; i++) {
                table += '<tr><td>' + axisData[i] + '</td>';
                opt.series.forEach(s => {
                  table += '<td>' + (s.data[i] != null ? s.data[i] : '') + '</td>';
                });
                table += '</tr>';
              }
              table += '</table>';

      
              return table;
            }
          },
          
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true },
      
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
          },
        }
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

      xAxis: [{ type: 'category', data: years }],
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
        axisLabel: { formatter: '{value}%' },

      }],


series: [
  { name: 'Actual Trips', type: 'bar', data: actual, label: labelOption, symbol: 'rect', lineStyle: { width: 4 }  }, //lineStyle: { width: 2 }
  { name: 'Female', type: 'bar', data: female, label: labelOption, symbol: 'roundRect', symbolSize: 5, }, 
  { name: 'Male', type: 'bar', data: male, label: labelOption, symbol: 'roundRect', symbolSize: 5, },
  { name: '18 to 24 years', type: 'bar', data: age18_24, label: labelOption , symbol: 'roundRect', symbolSize: 5,},
  { name: '25 to 44 years', type: 'bar', data: age25_44, label: labelOption , symbol: 'roundRect', symbolSize: 5,},
  { name: '45 to 64 years', type: 'bar', data: age45_64, label: labelOption , symbol: 'roundRect', symbolSize: 5,},
  { name: '65 years and older', type: 'bar', data: age65, label: labelOption, symbol: 'roundRect', symbolSize: 5,}
]
    };

    myChart.setOption(option);
  });


window.addEventListener('resize', myChart.resize);