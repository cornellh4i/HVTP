"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

export type GraphPoint = {
	label: string;
	grossIncome: number;
};

type GraphProps = {
	data: GraphPoint[];
};

const Y_AXIS_STEP = 10000;
const MIN_VISIBLE_TICK = 50000;

function formatYAxisTick(value: number): string {
	if (value === 0) {
		return "0";
	}

	return `${value / 1000}k`;
}

function getYAxisTicks(maxValue: number): number[] {
	const topTick = Math.max(MIN_VISIBLE_TICK, Math.floor(maxValue / Y_AXIS_STEP) * Y_AXIS_STEP);
	const ticks: number[] = [];

	for (let tick = 0; tick <= topTick; tick += Y_AXIS_STEP) {
		ticks.push(tick);
	}

	return ticks;
}

export default function Graph({ data }: GraphProps) {
	const maxValue = Math.max(...data.map((entry) => entry.grossIncome), 0);
	const yAxisMax = Math.max(
		Math.max(MIN_VISIBLE_TICK, Math.ceil(maxValue / Y_AXIS_STEP) * Y_AXIS_STEP),
		maxValue * 1.1,
	);
	const yAxisTicks = getYAxisTicks(maxValue);

	return (
		<div className="h-[430px] w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 24, right: 8, left: 12, bottom: 18 }} barCategoryGap="28%">
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
						width={52}
						domain={[0, yAxisMax]}
						ticks={yAxisTicks}
						tickFormatter={formatYAxisTick}
						tick={{ fill: "#5d5d5d", fontSize: 14 }}
						tickMargin={10}
					/>

					<Bar dataKey="grossIncome" fill="url(#gross-income-gradient)" barSize={140} radius={0}>
						<LabelList
							dataKey="grossIncome"
							position="top"
							formatter={(value) =>
								typeof value === "number" ? value.toLocaleString("en-US") : `${value ?? ""}`
							}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
