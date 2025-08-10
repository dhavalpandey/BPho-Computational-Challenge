// src/pages/Task2.js
import React from "react";
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

	// --- Raw Data ---
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

	// --- Calculations ---
	const experimentalDataPoints = rawData.map((d) => ({
		x: 1 / d.u,
		y: 1 / d.v,
	}));
	const { slope, intercept, rSquared, predict } = linearRegression(
		experimentalDataPoints,
	);
	const focalLength = 1 / intercept;

	// --- Data for Charting ---
	// Create a smooth line by defining its start and end points across the full chart domain
	const lineDomainData = [
		{ x: 0, y: predict(0) },
		{ x: 0.055, y: predict(0.055) },
	];

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
								left: 30,
								bottom: 30,
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
								domain={[0, 0.055]}
								stroke={theme.text}
								label={{
									value: "1/v (cm⁻¹)",
									angle: -90,
									position: "insideLeft",
									offset: -20,
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
							/>
							<Legend wrapperStyle={{ paddingTop: "20px" }} />
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
					The thin lens equation is <strong>1/u + 1/v = 1/f</strong>,
					where 'u' is object distance, 'v' is image distance, and 'f'
					is focal length. This can be rearranged into the linear form{" "}
					<strong>1/v = (-1) * (1/u) + (1/f)</strong>, which matches
					the equation of a straight line, y = mx + c.
				</p>
				<br />
				<p>
					This graph plots the experimental data of 1/v against 1/u. A
					line of best fit is calculated using linear regression.
				</p>
				<ul>
					<li>
						The <strong>slope (m)</strong> of the line should be
						close to -1. Our calculated slope is{" "}
						<ResultValue>{slope.toFixed(4)}</ResultValue>.
					</li>
					<li>
						The <strong>y-intercept (c)</strong> gives us 1/f. Our
						calculated intercept is{" "}
						<ResultValue>{intercept.toFixed(4)}</ResultValue>.
					</li>
					<li>
						The <strong>R² value</strong> (coefficient of
						determination) indicates how well the line fits the data
						(1 is a perfect fit). Our R² is{" "}
						<ResultValue>{rSquared.toFixed(4)}</ResultValue>,
						showing a very strong correlation.
					</li>
				</ul>
				<br />
				<p>
					From the y-intercept, the focal length of the lens is
					calculated to be{" "}
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
