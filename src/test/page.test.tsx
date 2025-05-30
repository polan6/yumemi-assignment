import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Home from "../app/page";
// HighchartsのモックでrequireActualを使わず、chartのみをモックすることでCSS.supportsエラーを回避
jest.mock("highcharts", () => ({
    chart: jest.fn(),
}));

const mockPrefs = [
    { prefCode: 1, prefName: "北海道" },
    { prefCode: 2, prefName: "青森県" },
];

import * as Highcharts from "highcharts";

// --- 既存のmockPopulation, beforeEach, テストケースは省略（省略せずに残してOK） ---

// 追加テスト: チェックボックスの初期状態
test("都道府県チェックボックスは初期状態で全て未選択", async () => {
    const { getByRole } = render(<Home />);
    const cb1 = await waitFor(() => getByRole("checkbox", { name: "北海道" }));
    const cb2 = await waitFor(() => getByRole("checkbox", { name: "青森県" }));
    expect((cb1 as HTMLInputElement).checked).toBe(false);
    expect((cb2 as HTMLInputElement).checked).toBe(false);
});


// 追加テスト: グラフ種類セレクトボックスの初期値
test("グラフ種類セレクトボックスの初期値は総人口", async () => {
    const { getByLabelText } = render(<Home />);
    const select = getByLabelText("グラフの種類") as HTMLSelectElement;
    expect(select.value).toBe("0");
});

// 追加テスト: グラフ種類セレクトボックスを変更すると値が変わる
test("グラフ種類セレクトボックスを変更すると値が変化する", async () => {
    const { getByLabelText } = render(<Home />);
    const select = getByLabelText("グラフの種類") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "2" } });
    expect(select.value).toBe("2");
});

// 追加テスト: 47都道府県分のチェックボックスが生成される（mockPrefsを47件にしてテストする場合）
test("prefsが47件ならチェックボックスも47個生成される", async () => {
    const prefs47 = Array.from({ length: 47 }, (_, i) => ({
        prefCode: i + 1,
        prefName: `都道府県${i + 1}`,
    }));
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === "/api/pref") {
            return Promise.resolve({
                json: () => Promise.resolve({ result: prefs47 }),
            });
        }
        return Promise.resolve({
            json: () => Promise.resolve({ result: { data: [{ label: "", data: [] }, { label: "", data: [] }, { label: "", data: [] }, { label: "", data: [] }] } }),
        });
    });
    const { findAllByRole } = render(<Home />);
    const checkboxes = await findAllByRole("checkbox");
    expect(checkboxes.length).toBe(47);
});

const mockPopulation = {
    1: {
        data: [
            { label: "総人口", data: [{ year: 2000, value: 100 }, { year: 2010, value: 110 }] },
            { label: "年少人口", data: [{ year: 2000, value: 10 }, { year: 2010, value: 11 }] },
            { label: "生産年齢人口", data: [{ year: 2000, value: 80 }, { year: 2010, value: 85 }] },
            { label: "老年人口", data: [{ year: 2000, value: 10 }, { year: 2010, value: 14 }] },
        ],
    },
    2: {
        data: [
            { label: "総人口", data: [{ year: 2000, value: 200 }, { year: 2010, value: 210 }] },
            { label: "年少人口", data: [{ year: 2000, value: 20 }, { year: 2010, value: 21 }] },
            { label: "生産年齢人口", data: [{ year: 2000, value: 160 }, { year: 2010, value: 170 }] },
            { label: "老年人口", data: [{ year: 2000, value: 20 }, { year: 2010, value: 19 }] },
        ],
    },
};

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((input: RequestInfo) => {
        const url = input.toString(); // string に変換

        if (url === "/api/pref") {
            return Promise.resolve({
                json: () => Promise.resolve({ result: mockPrefs }),
            } as Response);
        }
        if (url.startsWith("/api/data?prefCode=1")) {
            return Promise.resolve({
                json: () => Promise.resolve({ result: mockPopulation[1] }),
            } as Response);
        }
        if (url.startsWith("/api/data?prefCode=2")) {
            return Promise.resolve({
                json: () => Promise.resolve({ result: mockPopulation[2] }),
            } as Response);
        }
        return Promise.reject(new Error("Unknown URL"));
    }) as jest.Mock;
});

test("人口データが空の場合series.dataも空配列になる", async () => {
    const emptyPopulation = {
        data: [
            { label: "総人口", data: [] },
            { label: "年少人口", data: [] },
            { label: "生産年齢人口", data: [] },
            { label: "老年人口", data: [] },
        ],
    };
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === "/api/pref") {
            return Promise.resolve({
                json: () => Promise.resolve({ result: mockPrefs }),
            });
        }
        if (url.startsWith("/api/data?prefCode=1")) {
            return Promise.resolve({
                json: () => Promise.resolve({ result: emptyPopulation }),
            });
        }
        return Promise.reject();
    });
    const { getByRole } = render(<Home />);
    const cb1 = await waitFor(() => getByRole("checkbox", { name: "北海道" }));
    fireEvent.click(cb1);
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalledTimes(2);
    });
    const options = (Highcharts.chart as jest.Mock).mock.calls[1][0];
    expect(options.series[0].data).toEqual([]);
});

test("fetch失敗時でもクラッシュしない", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => Promise.reject("API Error"));
    const { getByText } = render(<Home />);
		await waitFor(() => {
				expect(Highcharts.chart).not.toHaveBeenCalled();
		});
    // 画面に都道府県を選択が表示されている
    expect(getByText("都道府県を選択")).toBeInTheDocument();
});


test("初期描画時にHighcharts.chartが呼ばれる", async () => {
    render(<Home />);
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalled();
    });
    const options = (Highcharts.chart as jest.Mock).mock.calls[0][0];
    expect(options.chart.renderTo).toBe("chart_container");
    expect(options.xAxis.title.text).toBe("年");
    expect(options.yAxis.title.text).toBe("人口");
    expect(options.series).toEqual([]);
});

test("都道府県チェックでseriesが追加されchartOptionsに反映される", async () => {
    const { getByRole } = render(<Home />);
    const cb1 = await waitFor(() => getByRole("checkbox", { name: "北海道" }));
    fireEvent.click(cb1);
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalledTimes(2);
    });
    const options = (Highcharts.chart as jest.Mock).mock.calls[1][0];
    expect(options.series.length).toBe(1);
    expect(options.series[0].name).toBe("北海道");
    expect(options.series[0].data).toEqual([
        { x: 2000, y: 100 },
        { x: 2010, y: 110 },
    ]);
});

test("グラフ種類を変更するとseriesのdataが切り替わる", async () => {
    const { getByRole, getByLabelText } = render(<Home />);
    const cb1 = await waitFor(() => getByRole("checkbox", { name: "北海道" }));
    fireEvent.click(cb1);
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalledTimes(2);
    });
    fireEvent.change(getByLabelText("グラフの種類"), { target: { value: "1" } });
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalledTimes(3);
    });
    const options = (Highcharts.chart as jest.Mock).mock.calls[2][0];
    expect(options.series[0].data).toEqual([
        { x: 2000, y: 10 },
        { x: 2010, y: 11 },
    ]);
});

test("legend, responsive, tooltip等のchartOptions設定値を検証", async () => {
    render(<Home />);
    await waitFor(() => {
        expect(Highcharts.chart).toHaveBeenCalled();
    });
    const options = (Highcharts.chart as jest.Mock).mock.calls[0][0];
    expect(options.legend.layout).toBe("vertical");
    expect(options.legend.align).toBe("right");
    expect(options.legend.verticalAlign).toBe("middle");
    expect(options.tooltip.valueSuffix).toBe("人");
    expect(options.responsive.rules[0].condition.maxWidth).toBe(600);
    expect(options.responsive.rules[0].chartOptions.legend.layout).toBe("horizontal");
});