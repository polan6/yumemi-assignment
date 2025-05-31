'use client'
import React,{ useEffect,useState } from "react";
import './page.css'
import Highcharts,{ Options,SeriesOptionsType } from 'highcharts';
import PrefList from "@/component/PrefList";

export default function Home() {
	type Pref = {
  	prefCode: number;
  	prefName: string;
	};
	type PopulationDataSet = {
  	year: number;
  	value: number;
	};
	type PopulationEntry = {
  	label: string;
  	data: PopulationDataSet[];
	};
	type PopulationInfo = {
  	data: PopulationEntry[];
	};

	const [prefs,setPrefs]=useState([])
	const [chartType,setChartType]=useState("0")
  const [checkedPrefs, setCheckedPrefs] = useState(() => {
    const initialState: Record<number, boolean> = {};
    for (let i = 1; i <= 47; i++) {
      initialState[i] = false;
    }
    return initialState;
  });
	const [populations, setPopulations] = useState(() => {
    const initialState: Record<number, PopulationInfo> = {};
    for (let i = 1; i <= 47; i++) {
      initialState[i] = {data:[{label:"",data:[]},{label:"",data:[]},{label:"",data:[]},{label:"",data:[]},]}
    }
    return initialState;
  });

	useEffect(()=>{
		async function fetchPrefs(){
			try {
				const res=await fetch('/api/pref')
				const data=await res.json()
				setPrefs(data.result)
				loadChart(data.result,checkedPrefs,populations,chartType)
			} catch (error) {
				console.error("Error fetching prefecture:", error);
				return;
			}
		}
		fetchPrefs()
	},[])

  const handlePrefChange = async(code: number) => {
		try {
			let newPopulations=populations
			if(!checkedPrefs[code]){
				const res=await fetch(`/api/data?prefCode=${code}`)
				const data=await res.json()

				newPopulations={...populations,[code]:data.result}
				setPopulations(newPopulations)
			}
			const newCheckedPrefs={...checkedPrefs,[code]: !checkedPrefs[code]}
			setCheckedPrefs(newCheckedPrefs)
			loadChart(prefs,newCheckedPrefs,newPopulations,chartType)
		} catch (error) {
			console.error("Error fetching population:", error);
			return;
		}
  };
	const handleChartTypeChange=(event:React.ChangeEvent<HTMLSelectElement>)=>{
		setChartType(event.target.value)
		loadChart(prefs,checkedPrefs,populations,event.target.value)
	}
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
	

  return (
		<>
			<div>都道府県を選択</div>
      <PrefList
        prefs={prefs}
        checkedPrefs={checkedPrefs}
        handlePrefChange={handlePrefChange}
      />
			<div className="chartTypes__container">
			グラフの種類　
			<select aria-label="グラフの種類" name="chartTypes" onChange={handleChartTypeChange} value={chartType}>
				<option value="0">総人口</option>
				<option value="1">年少人口</option>
				<option value="2">生産年齢人口</option>
				<option value="3">老年人口</option>
			</select>
			</div>
			<div id="chart_container"></div>
		</>
  );
}

export const dynamic = 'force-dynamic'