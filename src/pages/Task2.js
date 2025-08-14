// src/pages/Task2.js
import React, { useMemo } from "react";
import styled, { useTheme } from "styled-components";
import {
	ComposedChart,
	Scatter,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { linearRegression } from "../utils/physics";
import { motion } from "framer-motion";

const TaskContainer = styled(motion.div)`
	display: flex;
	flex-direction: column;
	gap: 2rem;
`;

const ChartWrapper = styled.div`
	height: 500px;
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 2rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
`;

const Title = styled.h2`
	margin-bottom: 1.5rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	border-left: 4px solid ${({ theme }) => theme.primary};
	padding-left: 1rem;
`;

const SummaryContainer = styled.div`
	background: ${({ theme }) => theme.accent};
	border-radius: 8px;
	padding: 1.5rem;
	line-height: 1.7;
	border: 1px solid ${({ theme }) => theme.line};
	font-size: 1rem;
`;

const SummaryTitle = styled.h3`
	margin-bottom: 1rem;
	color: ${({ theme }) => theme.primary};
`;

const ResultValue = styled.span`
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	background-color: ${({ theme }) => theme.line};
	padding: 2px 6px;
	border-radius: 4px;
	font-family: "Courier New", Courier, monospace;
`;

const Task2 = () => {
	const theme = useTheme();

	const {
		experimentalDataPoints,
		slope,
		intercept,
		rSquared,
		focalLength,
		lineDomainData,
	} = useMemo(() => {
		const rawData = [
			{ u: 20, v: 65.5 },
			{ u: 25, v: 40 },
			{ u: 30, v: 31 },
			{ u: 35, v: 27 },
			{ u: 40, v: 25 },
			{ u: 45, v: 23.1 },
			{ u: 50, v: 21.5 },
			{ u: 55, v: 20.5 },
		];

		const points = rawData.map((d) => ({ x: 1 / d.u, y: 1 / d.v }));
		const { slope, intercept, rSquared, predict } =
			linearRegression(points);
		const f = 1 / intercept;
		const lineData = [
			{ x: 0, y: predict(0) },
			{ x: 0.055, y: predict(0.055) },
		];

		return {
			experimentalDataPoints: points,
			slope,
			intercept,
			rSquared,
			focalLength: f,
			lineDomainData: lineData,
		};
	}, []);

	const percentageError = Math.abs((slope - -1) / -1) * 100;

	return (
		<TaskContainer>
			<div>
				<Title>Task 2: Verifying the Thin Lens Equation</Title>
				<ChartWrapper>
					<ResponsiveContainer width="100%" height="100%">
						<ComposedChart
							margin={{
								top: 20,
								right: 30,
								left: 40,
								bottom: 25,
							}}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={theme.line}
							/>
							<XAxis
								type="number"
								dataKey="x"
								name="1/u"
								unit=" cm⁻¹"
								domain={[0, 0.055]}
								stroke={theme.text}
								label={{
									value: "1/u (cm⁻¹)",
									position: "insideBottom",
									offset: -15,
									fill: theme.text,
								}}
							/>
							<YAxis
								type="number"
								dataKey="y"
								name="1/v"
								unit=" cm⁻¹"
								domain={[0, 0.07]}
								stroke={theme.text}
								label={{
									value: "1/v (cm⁻¹)",
									angle: -90,
									position: "insideLeft",
									offset: -25,
									fill: theme.text,
								}}
							/>
							<Tooltip
								cursor={{ strokeDasharray: "3 3" }}
								contentStyle={{
									backgroundColor: theme.accent,
									border: `1px solid ${theme.line}`,
									borderRadius: "8px",
								}}
								formatter={(value) => value.toFixed(4)}
							/>
							<Legend wrapperStyle={{ paddingTop: "25px" }} />
							<Scatter
								name="Experimental Data"
								data={experimentalDataPoints}
								fill={theme.primary}
							/>
							<Line
								name="Line of Best Fit"
								data={lineDomainData}
								dataKey="y"
								stroke="#ff7300"
								strokeWidth={3}
								dot={false}
								activeDot={false}
								legendType="line"
							/>
						</ComposedChart>
					</ResponsiveContainer>
				</ChartWrapper>
			</div>

			<SummaryContainer>
				<SummaryTitle>Analysis and Results</SummaryTitle>
				<p>
					The thin lens equation, <strong>1/u + 1/v = 1/f</strong>, is
					a cornerstone of geometric optics, relating an object's
					distance (u) and image distance (v) to a lens's focal length
					(f). By rearranging it to the linear form{" "}
					<strong>(1/v) = -1 * (1/u) + (1/f)</strong>, we can verify
					it experimentally by plotting 1/v versus 1/u. If the
					equation holds, the data should form a straight line.
				</p>
				<br />
				<p>
					<strong>Veracity Check:</strong> The theoretical slope of
					this line is exactly <strong>-1</strong>. Our linear
					regression on the experimental data yields a slope of{" "}
					<ResultValue>{slope.toFixed(4)}</ResultValue>, a percentage
					error of just{" "}
					<ResultValue>{percentageError.toFixed(2)}%</ResultValue>.
					The R² value of{" "}
					<ResultValue>{rSquared.toFixed(4)}</ResultValue> (where 1.0
					is a perfect fit) confirms the data's strong linear
					relationship. This provides excellent evidence for the
					veracity of the thin lens equation.
				</p>
				<br />
				<p>
					<strong>Focal Length Determination:</strong> The y-intercept
					of the best-fit line is theoretically equal to 1/f. From our
					intercept of{" "}
					<ResultValue>{intercept.toFixed(4)}</ResultValue>, we
					calculate the focal length of the lens to be{" "}
					<strong>
						f = 1 / {intercept.toFixed(4)} ≈{" "}
						<ResultValue>{focalLength.toFixed(2)} cm</ResultValue>
					</strong>
					.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task2;
