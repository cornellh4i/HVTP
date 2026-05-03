"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer as RC,
	XAxis,
	YAxis,
} from "recharts";

const ResponsiveContainer = RC as any;

export type GraphPoint = {
	label: string;
	value: number;
};

type GraphProps = {
	data: GraphPoint[];
	barLabelFormatter?: (value: number) => string;
};

const TARGET_Y_AXIS_STEPS = 4;
const Y_AXIS_PADDING_RATIO = 1.08;

function formatYAxisTick(value: number): string {
	if (value === 0) {
		return "0";
	}

	return `${value / 1000}k`;
}


function niceNumber(value: number): number {
	if (value <= 0) {
		return 1;
	}

	const exponent = Math.floor(Math.log10(value));
	const fraction = value / 10 ** exponent;

	if (fraction <= 1) {
		return 1 * 10 ** exponent;
	}

	if (fraction <= 2) {
		return 2 * 10 ** exponent;
	}

	if (fraction <= 5) {
		return 5 * 10 ** exponent;
	}

	return 10 ** (exponent + 1);
}

function getYAxisScale(maxValue: number): { topValue: number; step: number; ticks: number[] } {
	const paddedMax = Math.max(maxValue * Y_AXIS_PADDING_RATIO, 1);
	const step = niceNumber(paddedMax / TARGET_Y_AXIS_STEPS);
	const topValue = Math.max(step, Math.ceil(paddedMax / step) * step);
	const ticks: number[] = [];

	for (let tick = 0; tick <= topValue; tick += step) {
		ticks.push(tick);
	}

	return { topValue, step, ticks };
}

export default function Graph({ data, barLabelFormatter }: GraphProps) {
	const maxValue = Math.max(...data.map((entry) => entry.value), 0);
	const { topValue: yAxisMax, ticks: yAxisTicks } = getYAxisScale(maxValue);

	return (
		<div className="h-[430px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 18 }} barCategoryGap="28%">
					<defs>
						<linearGradient id="gross-income-gradient" x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stopColor="#516a11" />
							<stop offset="100%" stopColor="#a0ae7d" />
						</linearGradient>
					</defs>

					<CartesianGrid vertical={false} stroke="#d3d0a8" strokeWidth={1.2} />

					<XAxis
						dataKey="label"
						axisLine={false}
						tickLine={false}
						interval={0}
						dy={12}
						tick={{ fill: "#5d5d5d", fontSize: 14 }}
					/>

					<YAxis
						axisLine={false}
						tickLine={false}
						width={56}
						domain={[0, yAxisMax]}
						ticks={yAxisTicks}
						tickFormatter={formatYAxisTick}
						tick={{ fill: "#5d5d5d", fontSize: 14, textAnchor: "end" }}
						tickMargin={10}
						dx={0}
					/>

					<Bar dataKey="value" fill="url(#gross-income-gradient)" barSize={140} radius={0}>
						<LabelList
							dataKey="value"
							position="top"
							formatter={(value: any) =>
							typeof value === "number"
								? barLabelFormatter
								? barLabelFormatter(value)
								: value.toLocaleString("en-US")
								: `${value ?? ""}`
							}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
