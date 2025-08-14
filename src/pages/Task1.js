// src/pages/Task1.js
import React, { useMemo } from "react";
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

const ResultValue = styled.span`
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	background-color: ${({ theme }) => theme.line};
	padding: 2px 6px;
	border-radius: 4px;
	font-family: "Courier New", Courier, monospace;
`;

const Task1 = () => {
	const theme = useTheme();

	const glassData = useMemo(
		() =>
			Array.from({ length: 201 }, (_, i) => {
				const wavelength = 400 + i * 2;
				return {
					wavelength,
					refractiveIndex: getCrownGlassRefractiveIndex(wavelength),
				};
			}),
		[],
	);

	const waterData = useMemo(
		() =>
			Array.from({ length: 193 }, (_, i) => {
				const frequency = 405 + i * 2;
				return {
					frequency,
					refractiveIndex: getWaterRefractiveIndex(frequency),
				};
			}).filter((p) => !isNaN(p.refractiveIndex)),
		[],
	);

	const glassIndices = glassData.map((d) => d.refractiveIndex);
	const waterIndices = waterData.map((d) => d.refractiveIndex);
	const freqStart = 405,
		freqEnd = 790,
		totalFreqRange = freqEnd - freqStart;

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
								left: 40,
								bottom: 25,
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
									offset: -15,
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
									offset: -25,
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
								formatter={(value) => value.toFixed(5)}
							/>
							<Legend wrapperStyle={{ paddingTop: "25px" }} />
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
					<SummaryTitle>
						Analysis: Normal Dispersion in Glass
					</SummaryTitle>
					<p>
						This graph models the refractive index of BK7 Crown
						Glass, a common material for optical lenses and prisms.
						It is calculated using the Sellmeier equation, a precise
						empirical model for transparent media. The key
						observation is that the refractive index is not
						constant; it changes with the wavelength of light.
					</p>
					<p>
						Specifically, shorter wavelengths (like violet and blue
						light) have a higher refractive index (
						<ResultValue>
							{Math.max(...glassIndices).toFixed(4)}
						</ResultValue>
						) than longer wavelengths (like red light,{" "}
						<ResultValue>
							{Math.min(...glassIndices).toFixed(4)}
						</ResultValue>
						). This phenomenon, known as normal dispersion, is
						fundamental to how a prism separates white light into a
						spectrum, a process explored in Task 12.
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
								left: 40,
								bottom: 25,
							}}>
							<defs>
								<linearGradient
									id="waterGradient"
									x1="0"
									y1="0"
									x2="1"
									y2="0">
									{waterData.map((entry) => (
										<stop
											key={entry.frequency}
											offset={`${
												((entry.frequency - freqStart) /
													totalFreqRange) *
												100
											}%`}
											stopColor={frequencyToColor(
												entry.frequency,
											)}
										/>
									))}
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
									offset: -15,
									fill: theme.text,
								}}
							/>
							<YAxis
								type="number"
								domain={[1.33, 1.342]}
								tickFormatter={(tick) => tick.toFixed(3)}
								stroke={theme.text}
								label={{
									value: "Refractive Index (n)",
									angle: -90,
									position: "insideLeft",
									offset: -25,
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
								formatter={(value) => value.toFixed(5)}
							/>
							<Legend wrapperStyle={{ paddingTop: "25px" }} />
							{/* Layer 1: The visible gradient line (no tooltip interaction) */}
							<Line
								type="monotone"
								dataKey="refractiveIndex"
								stroke="url(#waterGradient)"
								strokeWidth={5}
								dot={false}
								activeDot={false}
								legendType="none"
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartWrapper>
				<SummaryContainer>
					<SummaryTitle>Analysis: Dispersion in Water</SummaryTitle>
					<p>
						This graph models the refractive index of water across
						the visible spectrum using the empirical formula
						provided in the challenge. Like glass, water exhibits
						dispersion, though the change is less pronounced.
					</p>
					<p>
						The refractive index ranges from approximately{" "}
						<ResultValue>
							{Math.min(...waterIndices).toFixed(4)}
						</ResultValue>{" "}
						for red light (lower frequency) to{" "}
						<ResultValue>
							{Math.max(...waterIndices).toFixed(4)}
						</ResultValue>{" "}
						for violet light (higher frequency). Although a small
						variation, this is the critical physical property that
						allows water droplets in the atmosphere to act like tiny
						prisms, creating rainbows. This will be the foundational
						model for the rainbow physics explored in Task 11.
					</p>
				</SummaryContainer>
			</div>
		</TaskContainer>
	);
};

export default Task1;
