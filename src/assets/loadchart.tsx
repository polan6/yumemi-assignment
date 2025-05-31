import { Pref,PopulationInfo } from './types';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';
const loadChart=(
		prefs:Pref[],
		newCheckedPrefs:{[key:number]:boolean},
		newPopulations: { [key: number]: PopulationInfo },
		newChartType:string)=>{
		const seriesList=[]
		for (let i = 1; i <= 47; i++) {
			if(newCheckedPrefs[i]){
				const series: SeriesOptionsType={type:"line",name:"",data:[]}
				series.name=prefs[i-1].prefName
				series.data=newPopulations[i].data[Number(newChartType)].data
				.map((set:{year:number,value:number})=>(
					{x:set.year,y:set.value}
				))
				seriesList.push(series)

			}
		}
		const chartOptions: Options = {
			chart: {
    		renderTo: "chart_container",
    		type: "line",
  		},
			title : {
				text: ''
			},
			xAxis : {
				title: {
					text: '年'
				},
			},
			yAxis : {
				title: {
					text: '人口'
				},
				labels: {
					formatter: function () {
						return this.value.toLocaleString(); // 数字をそのまま表示（KやMなし）
					}
				}
			},
			tooltip : {
				valueSuffix: '人'
			},
			legend : {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series :seriesList,
			responsive: {
				rules: [{
					condition: {
							maxWidth: 600
					},
					chartOptions: {
						legend: {
							layout: 'horizontal',
							align: 'center',
							verticalAlign: 'bottom'
						}
					}
				}]
			}
		}
		Highcharts.chart(chartOptions)
	}
export default loadChart
