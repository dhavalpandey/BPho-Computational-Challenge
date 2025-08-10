// src/pages/Task1.js
import React from "react";
import styled, { useTheme } from "styled-components";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import {
	getCrownGlassRefractiveIndex,
	getWaterRefractiveIndex,
	frequencyToColor,
} from "../utils/physics";
import { motion } from "framer-motion";

const TaskContainer = styled(motion.div)`
	display: flex;
	flex-direction: column;
	gap: 4rem;
`;

const ChartWrapper = styled.div`
	height: 450px;
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
	margin-top: 2rem;
	font-size: 1rem;
`;

const SummaryTitle = styled.h3`
	margin-bottom: 1rem;
	color: ${({ theme }) => theme.primary};
`;

const Task1 = () => {
	const theme = useTheme();

	const glassData = Array.from({ length: 201 }, (_, i) => {
		const wavelength = 400 + i * 2;
		return {
			wavelength,
			refractiveIndex: getCrownGlassRefractiveIndex(wavelength),
		};
	});

	const freqStart = 405,
		freqEnd = 790;
	const totalFreqRange = freqEnd - freqStart;
	const waterData = Array.from({ length: 193 }, (_, i) => {
		const frequency = freqStart + i * 2;
		return {
			frequency,
			refractiveIndex: getWaterRefractiveIndex(frequency),
			color: frequencyToColor(frequency),
		};
	});

	return (
		<TaskContainer>
			<div>
				<Title>Task 1a: Refractive Index of Crown Glass</Title>
				<ChartWrapper>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={glassData}
							margin={{
								top: 5,
								right: 30,
								left: 30,
								bottom: 20,
							}}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={theme.line}
							/>
							<XAxis
								dataKey="wavelength"
								type="number"
								domain={[400, 800]}
								stroke={theme.text}
								label={{
									value: "Wavelength (nm)",
									position: "insideBottom",
									offset: -10,
									fill: theme.text,
								}}
							/>
							<YAxis
								type="number"
								domain={[1.51, 1.54]}
								stroke={theme.text}
								label={{
									value: "Refractive Index (n)",
									angle: -90,
									position: "insideLeft",
									offset: -20,
									fill: theme.text,
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: theme.accent,
									border: `1px solid ${theme.line}`,
									borderRadius: "8px",
								}}
								itemStyle={{ color: theme.text }}
							/>
							<Legend wrapperStyle={{ paddingTop: "20px" }} />
							<Line
								type="monotone"
								dataKey="refractiveIndex"
								name="Crown Glass (BK7)"
								stroke={theme.primary}
								strokeWidth={3}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartWrapper>
				<SummaryContainer>
					<SummaryTitle>What you are seeing</SummaryTitle>
					<p>
						This graph shows how the refractive index (a measure of
						how much light bends) of BK7 Crown Glass changes with
						the wavelength of light. The relationship is defined by
						the Sellmeier equation. Notice that the refractive index
						is higher for shorter wavelengths (like blue light) than
						for longer wavelengths (like red light). This phenomenon
						is called <strong>dispersion</strong> and is the
						fundamental reason why prisms can split white light into
						a rainbow.
					</p>
				</SummaryContainer>
			</div>

			<div>
				<Title>Task 1b: Refractive Index of Water</Title>
				<ChartWrapper>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={waterData}
							margin={{
								top: 5,
								right: 30,
								left: 30,
								bottom: 20,
							}}>
							<defs>
								<linearGradient
									id="waterGradient"
									x1="0"
									y1="0"
									x2="1"
									y2="0">
									{waterData.map((entry) => {
										const offset =
											(entry.frequency - freqStart) /
											totalFreqRange;
										return (
											<stop
												key={entry.frequency}
												offset={offset}
												stopColor={entry.color}
											/>
										);
									})}
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={theme.line}
							/>
							<XAxis
								dataKey="frequency"
								type="number"
								domain={[freqStart, freqEnd]}
								stroke={theme.text}
								label={{
									value: "Frequency (THz)",
									position: "insideBottom",
									offset: -10,
									fill: theme.text,
								}}
							/>
							<YAxis
								type="number"
								domain={[1.33, 1.34]}
								tickFormatter={(tick) => tick.toFixed(3)}
								stroke={theme.text}
								label={{
									value: "Refractive Index (n)",
									angle: -90,
									position: "insideLeft",
									offset: -20,
									fill: theme.text,
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: theme.accent,
									border: `1px solid ${theme.line}`,
									borderRadius: "8px",
								}}
								itemStyle={{ color: theme.text }}
							/>
							<Line
								type="monotone"
								dataKey="refractiveIndex"
								name="Water"
								stroke="url(#waterGradient)"
								strokeWidth={5}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartWrapper>
				<SummaryContainer>
					<SummaryTitle>What you are seeing</SummaryTitle>
					<p>
						This graph shows how the refractive index of water
						changes with the frequency of light, based on the
						empirical formula provided in the challenge. The line is
						colored to match the actual color of light at each
						frequency. Just like with glass, the refractive index
						varies across the spectrum. This property of water is
						essential for understanding how rainbows are formed, a
						topic explored in Task 11.
					</p>
				</SummaryContainer>
			</div>
		</TaskContainer>
	);
};

export default Task1;
