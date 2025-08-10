// src/pages/Task3.js
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

// --- Styled Components ---
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
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 2rem;
	align-items: center;
`;

const ControlAndVizContainer = styled.div`
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 2rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
	height: 100%;
`;

const SVGContainer = styled.div`
	width: 100%;
	aspect-ratio: 16 / 9;
	margin-top: 1rem;
`;

const SummaryContainer = styled.div`
	grid-column: 1 / -1; /* Span full width */
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

const Task3 = () => {
	const theme = useTheme();
	const [L, setL] = useState(2); // Total horizontal distance in meters
	const [y, setY] = useState(1); // Height in meters
	const [interactiveX, setInteractiveX] = useState(L / 2); // Position of ray on mirror

	const { chartData, minTime, minX } = useMemo(() => {
		const data = [];
		const SPEED_OF_LIGHT = 299792458; // m/s
		let calculatedMinTime = Infinity;
		let calculatedMinX = 0;

		const steps = 200;
		for (let i = 0; i <= steps; i++) {
			const x = (i / steps) * L;
			const distA = Math.sqrt(x ** 2 + y ** 2);
			const distB = Math.sqrt((L - x) ** 2 + y ** 2);
			const time = (distA + distB) / SPEED_OF_LIGHT;

			if (time < calculatedMinTime) {
				calculatedMinTime = time;
				calculatedMinX = x;
			}
			data.push({ x, time: time * 1e9 }); // Convert time to nanoseconds for readability
		}
		return {
			chartData: data,
			minTime: calculatedMinTime * 1e9,
			minX: calculatedMinX,
		};
	}, [L, y]);

	// Handle slider update for L, ensuring interactiveX stays within bounds
	const handleLChange = (e) => {
		const newL = parseFloat(e.target.value);
		setL(newL);
		if (interactiveX > newL) {
			setInteractiveX(newL);
		}
	};

	// Calculate angles for the interactive diagram
	const angleOfIncidence = Math.atan2(interactiveX, y) * (180 / Math.PI);
	const angleOfReflection = Math.atan2(L - interactiveX, y) * (180 / Math.PI);

	return (
		<TaskContainer>
			<Title>Task 3: Fermat's Principle and the Law of Reflection</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<Slider
						label="Horizontal Separation (L)"
						min={1}
						max={5}
						step={0.1}
						value={L}
						onChange={handleLChange}
						unit="m"
					/>
					<Slider
						label="Vertical Height (y)"
						min={0.5}
						max={3}
						step={0.1}
						value={y}
						onChange={(e) => setY(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Ray Position on Mirror (x)"
						min={0}
						max={L}
						step={L / 200}
						value={interactiveX}
						onChange={(e) =>
							setInteractiveX(parseFloat(e.target.value))
						}
						unit="m"
					/>

					<SVGContainer>
						<svg
							width="100%"
							height="100%"
							viewBox={`-0.5 ${-y * 0.1} ${L + 1} ${y * 1.2}`}>
							<line
								x1="0"
								y1="0"
								x2={L}
								y2="0"
								stroke={theme.line}
								strokeWidth="0.05"
							/>
							<circle
								cx="0"
								cy={y}
								r="0.05"
								fill={theme.primary}
							/>
							<text
								x="0"
								y={y + 0.15}
								fill={theme.text}
								fontSize="0.15"
								textAnchor="middle">
								A
							</text>
							<circle
								cx={L}
								cy={y}
								r="0.05"
								fill={theme.primary}
							/>
							<text
								x={L}
								y={y + 0.15}
								fill={theme.text}
								fontSize="0.15"
								textAnchor="middle">
								B
							</text>
							<path
								d={`M 0 ${y} L ${interactiveX} 0 L ${L} ${y}`}
								stroke="#ff7300"
								strokeWidth="0.03"
								fill="none"
							/>
							<line
								x1={interactiveX}
								y1="0"
								x2={interactiveX}
								y2={y * 0.3}
								stroke={theme.text}
								strokeWidth="0.02"
								strokeDasharray="0.05"
							/>
							<text
								x={interactiveX + 0.1}
								y={y * 0.25}
								fill={theme.text}
								fontSize="0.15">
								θ: {angleOfIncidence.toFixed(1)}°
							</text>
							<text
								x={interactiveX - 0.1}
								y={y * 0.25}
								fill={theme.text}
								fontSize="0.15"
								textAnchor="end">
								φ: {angleOfReflection.toFixed(1)}°
							</text>
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
									value: "Reflection Position x (m)",
									position: "insideBottom",
									offset: -15,
									fill: theme.text,
								}}
							/>
							{/* FIX: Use a function for the domain to add padding correctly */}
							<YAxis
								type="number"
								dataKey="time"
								domain={[
									(dataMin) => dataMin * 0.999,
									(dataMax) => dataMax * 1.001,
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
				<SummaryTitle>
					Analysis: Fermat's Principle of Least Time
				</SummaryTitle>
				<p>
					Fermat's Principle states that light travels between two
					points along the path that requires the least time. In this
					simulation, we calculate the total travel time for a light
					ray going from point A to point B by reflecting off a mirror
					at a variable position 'x'.
				</p>
				<br />
				<p>
					The graph on the right plots this travel time against 'x'.
					As you can see, there is a distinct minimum point on the
					curve, representing the fastest possible path. This minimum
					occurs at x = <ResultValue>{minX.toFixed(2)} m</ResultValue>
					.
				</p>
				<p>
					The total horizontal distance is L ={" "}
					<ResultValue>{L.toFixed(2)} m</ResultValue>, so the halfway
					point is L/2 ={" "}
					<ResultValue>{(L / 2).toFixed(2)} m</ResultValue>. The
					minimum time path occurs precisely when the reflection point
					is halfway between A and B.
				</p>
				<p>
					On the left, the interactive diagram shows that only when
					the ray position is set to this minimum point (x ≈ L/2) do
					the angle of incidence (θ) and angle of reflection (φ)
					become equal. This demonstrates how Fermat's Principle gives
					rise to the Law of Reflection.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task3;
