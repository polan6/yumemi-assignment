export type Pref = {
	prefCode: number;
	prefName: string;
};
export type PopulationDataSet = {
	year: number;
	value: number;
};
export type PopulationEntry = {
	label: string;
	data: PopulationDataSet[];
};
export type PopulationInfo = {
	data: PopulationEntry[];
};