// src/pages/Task4.js
import React, { useState, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceDot,
	Label as RechartsLabel,
} from "recharts";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import { findRefractionPoint } from "../utils/physics"; // <-- Import the new function

// --- Styled Components --- (Identical to before)
const TaskContainer = styled(motion.div)``;

const Title = styled.h2`
	margin-bottom: 1.5rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	border-left: 4px solid ${({ theme }) => theme.primary};
	padding-left: 1rem;
`;

const TwoColumnLayout = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
	gap: 2rem;
	align-items: stretch;
`;

const ControlAndVizContainer = styled.div`
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 2rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
	display: flex;
	flex-direction: column;
`;

const SVGContainer = styled.div`
	width: 100%;
	flex-grow: 1;
	min-height: 250px;
	margin-top: 1rem;
`;

const SummaryContainer = styled.div`
	grid-column: 1 / -1;
	background: ${({ theme }) => theme.accent};
	border-radius: 8px;
	padding: 1.5rem;
	line-height: 1.7;
	border: 1px solid ${({ theme }) => theme.line};
	margin-top: 2rem;
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

const Equation = styled.div`
	margin: 1rem 0;
	padding: 1rem;
	background: ${({ theme }) => theme.body};
	border-radius: 6px;
	text-align: center;
	font-family: "Courier New", Courier, monospace;
	font-size: 1.1rem;
`;

const Task4 = () => {
	const theme = useTheme();
	const [L, setL] = useState(2);
	const [y1, setY1] = useState(1);
	const [y2, setY2] = useState(1);
	const [n1, setN1] = useState(1.0);
	const [n2, setN2] = useState(1.33);

	const { chartData, minTime, minX, snellLeft, snellRight } = useMemo(() => {
		const SPEED_OF_LIGHT = 299792458;

		// STEP 1: Calculate the PRECISE minimum x using the root-finding algorithm
		const preciseMinX = findRefractionPoint(L, y1, y2, n1, n2);

		// STEP 2: Calculate the true minimum time using this precise x
		const dist1_min = Math.sqrt(preciseMinX ** 2 + y1 ** 2);
		const dist2_min = Math.sqrt((L - preciseMinX) ** 2 + y2 ** 2);
		const preciseMinTime =
			(n1 * dist1_min + n2 * dist2_min) / SPEED_OF_LIGHT;

		// STEP 3: Generate the data for the visual chart plot
		const data = Array.from({ length: 201 }, (_, i) => {
			const x = (i / 200) * L;
			const dist1 = Math.sqrt(x ** 2 + y1 ** 2);
			const dist2 = Math.sqrt((L - x) ** 2 + y2 ** 2);
			const time = (n1 * dist1 + n2 * dist2) / SPEED_OF_LIGHT;
			return { x, time: time * 1e9 }; // Time in nanoseconds
		});

		// STEP 4: Calculate Snell's Law values at the PRECISE minimum for verification
		const theta1_rad = Math.atan2(preciseMinX, y1);
		const theta2_rad = Math.atan2(L - preciseMinX, y2);
		const snellLeftVal = n1 * Math.sin(theta1_rad);
		const snellRightVal = n2 * Math.sin(theta2_rad);

		return {
			chartData: data,
			minTime: preciseMinTime * 1e9,
			minX: preciseMinX,
			snellLeft: snellLeftVal,
			snellRight: snellRightVal,
		};
	}, [L, y1, y2, n1, n2]);

	return (
		<TaskContainer>
			<Title>Task 4: Fermat's Principle and the Law of Refraction</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<Slider
						label="Refractive Index n₁ (Top)"
						min={1.0}
						max={2.5}
						step={0.01}
						value={n1}
						onChange={(e) => setN1(parseFloat(e.target.value))}
					/>
					<Slider
						label="Refractive Index n₂ (Bottom)"
						min={1.0}
						max={2.5}
						step={0.01}
						value={n2}
						onChange={(e) => setN2(parseFloat(e.target.value))}
					/>
					<Slider
						label="Horizontal Separation (L)"
						min={1}
						max={5}
						step={0.1}
						value={L}
						onChange={(e) => setL(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Height of A (y₁)"
						min={0.5}
						max={3}
						step={0.1}
						value={y1}
						onChange={(e) => setY1(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Depth of B (y₂)"
						min={0.5}
						max={3}
						step={0.1}
						value={y2}
						onChange={(e) => setY2(parseFloat(e.target.value))}
						unit="m"
					/>

					<SVGContainer>
						<svg
							width="100%"
							height="100%"
							viewBox={`-0.5 ${-y2 - 0.5} ${L + 1} ${
								y1 + y2 + 1
							}`}>
							<rect
								x={-0.5}
								y={0}
								width={L + 1}
								height={y1 + 0.5}
								fill={theme.body}
								opacity="0.3"
							/>
							<rect
								x={-0.5}
								y={-y2 - 0.5}
								width={L + 1}
								height={y2 + 0.5}
								fill={theme.primary}
								opacity="0.1"
							/>
							<line
								x1={-0.5}
								y1="0"
								x2={L + 0.5}
								y2="0"
								stroke={theme.line}
								strokeWidth="0.05"
							/>
							<circle
								cx="0"
								cy={y1}
								r="0.05"
								fill={theme.primary}
							/>
							<text
								x="0"
								y={y1 + 0.2}
								fill={theme.text}
								fontSize="0.15"
								textAnchor="middle">
								A (n₁={n1.toFixed(2)})
							</text>
							<circle
								cx={L}
								cy={-y2}
								r="0.05"
								fill={theme.primary}
							/>
							<text
								x={L}
								y={-y2 - 0.15}
								fill={theme.text}
								fontSize="0.15"
								textAnchor="middle">
								B (n₂={n2.toFixed(2)})
							</text>
							<path
								d={`M 0 ${y1} L ${minX} 0 L ${L} ${-y2}`}
								stroke="#ff7300"
								strokeWidth="0.03"
								fill="none"
							/>
							<line
								x1={minX}
								y1={y1 * 0.3}
								x2={minX}
								y2={-y2 * 0.3}
								stroke={theme.text}
								strokeWidth="0.02"
								strokeDasharray="0.05"
							/>
						</svg>
					</SVGContainer>
				</ControlAndVizContainer>

				<ControlAndVizContainer>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
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
								domain={[0, L]}
								stroke={theme.text}
								label={{
									value: "Crossing Position x (m)",
									position: "insideBottom",
									offset: -15,
									fill: theme.text,
								}}
							/>
							<YAxis
								type="number"
								dataKey="time"
								domain={[
									(dataMin) => dataMin * 0.999,
									(dataMax) => dataMax * 1.01,
								]}
								stroke={theme.text}
								label={{
									value: "Travel Time (ns)",
									angle: -90,
									position: "insideLeft",
									offset: -20,
									fill: theme.text,
								}}
								tickFormatter={(t) => t.toFixed(1)}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: theme.accent,
									border: `1px solid ${theme.line}`,
									borderRadius: "8px",
								}}
								formatter={(value) => `${value.toFixed(3)} ns`}
							/>
							<Line
								type="monotone"
								dataKey="time"
								stroke={theme.primary}
								strokeWidth={3}
								dot={false}
							/>
							<ReferenceDot
								x={minX}
								y={minTime}
								r={8}
								fill="#ff7300"
								stroke="white">
								<RechartsLabel
									value="Minimum Time"
									position="top"
									offset={15}
									fill={theme.text}
								/>
							</ReferenceDot>
						</LineChart>
					</ResponsiveContainer>
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>Analysis: Verifying Snell's Law</SummaryTitle>
				<p>
					This simulation demonstrates that Snell's Law of Refraction
					is a direct result of light following the path of least
					time. The chart shows the travel time for a ray moving from
					medium 1 (n₁) to medium 2 (n₂) via a crossing point 'x' on
					the boundary.
				</p>
				<p>
					Using a precise numerical solver, the path of minimum time
					is found at{" "}
					<ResultValue>x = {minX.toFixed(4)} m</ResultValue>.
				</p>
				<p>
					At this specific point, we can check if Snell's Law (
					<strong>n₁ sin(θ₁) = n₂ sin(θ₂)</strong>) holds true:
				</p>
				<Equation>
					n₁ sin(θ₁) ={" "}
					<ResultValue>{snellLeft.toFixed(8)}</ResultValue>{" "}
					&nbsp;&nbsp; | &nbsp;&nbsp; n₂ sin(θ₂) ={" "}
					<ResultValue>{snellRight.toFixed(8)}</ResultValue>
				</Equation>
				<p>
					The two values are now equal to a high degree of precision,
					confirming that the path of minimum time is precisely the
					one that obeys the Law of Refraction. Adjust the sliders to
					see how the optimal path changes while this equality always
					holds.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task4;
