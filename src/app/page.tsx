'use client'
import React,{ useEffect,useState } from "react";
import './page.css'
import { PopulationInfo } from '../assets/types';
import PrefList from "@/component/PrefList";
import loadChart from "@/assets/loadchart";

export default function Home() {
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
			<div className="footer">
			GitHub: <a href="https://github.com/polan6/yumemi-assignment">https://github.com/polan6/yumemi-assignment</a>
			</div>
		</>
  );
}

export const dynamic = 'force-dynamic'