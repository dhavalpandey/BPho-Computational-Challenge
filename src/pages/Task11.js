// src/pages/Task11.js
import React, {
	useState,
	useMemo,
	useEffect,
	useRef,
	useCallback,
} from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import Slider from "../components/Slider";
import {
	getWaterRefractiveIndex,
	frequencyToColor,
	calculateRainbowAngles,
	findRainbowMinDeviation,
} from "../utils/physics";

// --- Styled Components ---
const TaskContainer = styled(motion.div)``;
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
const ChartWrapper = styled.div`
	height: 500px;
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 1rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
`;
const ControlAndVizContainer = styled.div`
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 2rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
	min-height: 500px;
	display: flex;
	flex-direction: column;
`;
const TabContainer = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-bottom: 2rem;
	border-bottom: 2px solid ${({ theme }) => theme.line};
	flex-wrap: wrap;
`;
const TabButton = styled(motion.button)`
	padding: 0.75rem 1.5rem;
	border: none;
	background: none;
	color: ${({ theme, $isActive }) =>
		$isActive ? theme.primary : theme.text};
	font-weight: ${({ $isActive }) => ($isActive ? "700" : "500")};
	cursor: pointer;
	position: relative;
	opacity: ${({ $isActive }) => ($isActive ? 1 : 0.7)};
	transition: opacity 0.2s ease;
	&:hover {
		opacity: 1;
	}
`;
const Underline = styled(motion.div)`
	position: absolute;
	bottom: -2px;
	left: 0;
	right: 0;
	height: 2px;
	background: ${({ theme }) => theme.primary};
`;
const Canvas = styled.canvas`
	width: 100%;
	height: 100%;
	border-radius: 8px;
`;

// --- Main Component ---
const Task11 = () => {
	const [activeTab, setActiveTab] = useState("11a");
	const tabs = [
		{ id: "11a", label: "Elevation vs. Incidence" },
		{ id: "11b", label: "Rainbow Angle vs. Frequency" },
		{ id: "11c", label: "Refraction Angle vs. Frequency" },
		{ id: "11d", label: "Rainbow Simulator" },
	];
	return (
		<TaskContainer>
			<Title>Task 11: Rainbow Physics</Title>
			<TabContainer>
				{tabs.map((tab) => (
					<TabButton
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						$isActive={activeTab === tab.id}>
						{tab.label}
						{activeTab === tab.id && (
							<Underline layoutId="underline" />
						)}
					</TabButton>
				))}
			</TabContainer>
			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab}
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -10, opacity: 0 }}
					transition={{ duration: 0.2 }}>
					{activeTab === "11a" && <View11a />}
					{activeTab === "11b" && <View11b />}
					{activeTab === "11c" && <View11c />}
					{activeTab === "11d" && <View11d />}
				</motion.div>
			</AnimatePresence>
		</TaskContainer>
	);
};

// --- Sub-Components ---
const View11a = () => {
	/* ... Code from previous correct response ... */
	const theme = useTheme();
	const data = useMemo(() => {
		const points = [];
		const colors = { Red: 442.5, Green: 565, Blue: 650 };
		for (let i = 0; i <= 900; i++) {
			const theta = i / 10;
			let point = { theta };
			for (const [color, freq] of Object.entries(colors)) {
				const n = getWaterRefractiveIndex(freq);
				const { primary_epsilon_deg, secondary_epsilon_deg } =
					calculateRainbowAngles(theta, n);
				point[`primary${color}`] =
					primary_epsilon_deg < 0 ? null : primary_epsilon_deg;
				point[`secondary${color}`] = secondary_epsilon_deg;
			}
			points.push(point);
		}
		return points;
	}, []);

	return (
		<>
			<ChartWrapper>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={theme.line}
						/>
						<XAxis
							dataKey="theta"
							type="number"
							domain={[0, 90]}
							stroke={theme.text}
							label={{
								value: "Angle of Incidence θ (°)",
								position: "insideBottom",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<YAxis
							type="number"
							domain={[0, 180]}
							stroke={theme.text}
							label={{
								value: "Elevation Angle ε (°)",
								angle: -90,
								position: "insideLeft",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: theme.accent,
								border: `1px solid ${theme.line}`,
							}}
						/>
						<Legend wrapperStyle={{ paddingTop: "20px" }} />
						<Line
							connectNulls
							dataKey="primaryRed"
							name="Primary (Red)"
							dot={false}
							stroke="#e74c3c"
							strokeWidth={2}
						/>
						<Line
							connectNulls
							dataKey="primaryGreen"
							name="Primary (Green)"
							dot={false}
							stroke="#2ecc71"
							strokeWidth={2}
						/>
						<Line
							connectNulls
							dataKey="primaryBlue"
							name="Primary (Blue)"
							dot={false}
							stroke="#3498db"
							strokeWidth={2}
						/>
						<Line
							connectNulls
							dataKey="secondaryRed"
							name="Secondary (Red)"
							dot={false}
							stroke="#e74c3c"
							strokeDasharray="5 5"
							strokeWidth={2}
						/>
						<Line
							connectNulls
							dataKey="secondaryGreen"
							name="Secondary (Green)"
							dot={false}
							stroke="#2ecc71"
							strokeDasharray="5 5"
							strokeWidth={2}
						/>
						<Line
							connectNulls
							dataKey="secondaryBlue"
							name="Secondary (Blue)"
							dot={false}
							stroke="#3498db"
							strokeDasharray="5 5"
							strokeWidth={2}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartWrapper>
			<SummaryContainer>
				<SummaryTitle>11a: Elevation vs. Incidence Angle</SummaryTitle>
				<p>
					This graph shows the exit angle (elevation, ε) of a light
					ray from a water droplet based on its initial entry angle
					(incidence, θ). Notice that for both the primary (solid
					lines) and secondary (dashed lines) rainbows, the curves
					flatten out. This "flattening" creates a concentration of
					light at a specific angle—the rainbow angle. Many different
					incident angles all exit at roughly the same elevation,
					making the rainbow bright and visible.
				</p>
			</SummaryContainer>
		</>
	);
};

const View11b = () => {
	const theme = useTheme();
	const data = useMemo(() => {
		return Array.from({ length: 193 }, (_, i) => {
			const freq = 405 + i * 2;
			const n = getWaterRefractiveIndex(freq);
			if (isNaN(n)) return null;
			const { primary_theta_deg, secondary_theta_deg } =
				findRainbowMinDeviation(n);
			const { primary_epsilon_deg } = calculateRainbowAngles(
				primary_theta_deg,
				n,
			);
			const { secondary_epsilon_deg } = calculateRainbowAngles(
				secondary_theta_deg,
				n,
			);
			return {
				frequency: freq,
				primaryAngle: primary_epsilon_deg,
				secondaryAngle: secondary_epsilon_deg,
			};
		}).filter(Boolean);
	}, []);

	return (
		<>
			<ChartWrapper>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={theme.line}
						/>
						<XAxis
							dataKey="frequency"
							type="number"
							domain={[405, 790]}
							stroke={theme.text}
							label={{
								value: "Frequency of Light (THz)",
								position: "insideBottom",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<YAxis
							type="number"
							domain={[40, 54]}
							stroke={theme.text}
							label={{
								value: "Rainbow Elevation Angle ε (°)",
								angle: -90,
								position: "insideLeft",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: theme.accent,
								border: `1px solid ${theme.line}`,
							}}
						/>
						<defs>
							<linearGradient
								id="primaryGradient"
								x1="0"
								y1="0"
								x2="1"
								y2="0">
								{data.map((d) => (
									<stop
										key={`p-${d.frequency}`}
										offset={`${
											((d.frequency - 405) /
												(790 - 405)) *
											100
										}%`}
										stopColor={frequencyToColor(
											d.frequency,
										)}
									/>
								))}
							</linearGradient>
							<linearGradient
								id="secondaryGradient"
								x1="0"
								y1="0"
								x2="1"
								y2="0">
								{data.map((d) => (
									<stop
										key={`s-${d.frequency}`}
										offset={`${
											((d.frequency - 405) /
												(790 - 405)) *
											100
										}%`}
										stopColor={frequencyToColor(
											d.frequency,
										)}
									/>
								))}
							</linearGradient>
						</defs>
						<Line
							type="monotone"
							dataKey="primaryAngle"
							stroke="url(#primaryGradient)"
							strokeWidth={8}
							dot={false}
							name="Primary Rainbow"
						/>
						<Line
							type="monotone"
							dataKey="secondaryAngle"
							stroke="url(#secondaryGradient)"
							strokeWidth={8}
							dot={false}
							name="Secondary Rainbow"
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartWrapper>
			<SummaryContainer>
				<SummaryTitle>
					11b: Rainbow Angle vs. Light Frequency
				</SummaryTitle>
				<p>
					This chart shows the precise angle of a rainbow for each
					frequency (color) of light. Because the refractive index of
					water is slightly different for each color (dispersion),
					each color forms its rainbow at a slightly different angle.
					For the primary rainbow (the lower, brighter one), red light
					appears at a higher angle (~42.5°) and violet light at a
					lower angle (~40.9°). For the secondary rainbow, this order
					is reversed.
				</p>
			</SummaryContainer>
		</>
	);
};

const View11c = () => {
	/* ... Code from previous correct response ... */
	const theme = useTheme();
	const data = useMemo(() => {
		const points = [];
		for (let freq = 405; freq <= 790; freq += 2) {
			const n = getWaterRefractiveIndex(freq);
			if (isNaN(n)) continue;
			const { primary_theta_deg } = findRainbowMinDeviation(n);
			const { phi_deg: primary_phi } = calculateRainbowAngles(
				primary_theta_deg,
				n,
			);
			const criticalAngle = Math.asin(1 / n) * (180 / Math.PI);
			points.push({
				frequency: freq,
				primaryPhi: primary_phi,
				criticalAngle: criticalAngle,
			});
		}
		return points;
	}, []);

	return (
		<>
			<ChartWrapper>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={data}
						margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={theme.line}
						/>
						<XAxis
							dataKey="frequency"
							type="number"
							domain={[405, 790]}
							stroke={theme.text}
							label={{
								value: "Frequency of Light (THz)",
								position: "insideBottom",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<YAxis
							type="number"
							domain={[38, 50]}
							stroke={theme.text}
							label={{
								value: "Refraction Angle φ (°)",
								angle: -90,
								position: "insideLeft",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: theme.accent,
								border: `1px solid ${theme.line}`,
							}}
						/>
						<Legend wrapperStyle={{ paddingTop: "20px" }} />
						{data.slice(0, -1).map((p, i) => (
							<Line
								key={`phi-${p.frequency}`}
								type="monotone"
								dataKey="primaryPhi"
								data={[p, data[i + 1]]}
								stroke={frequencyToColor(p.frequency)}
								strokeWidth={3}
								dot={false}
								legendType="none"
							/>
						))}
						<Line
							dataKey="criticalAngle"
							name="Critical Angle"
							stroke={theme.text}
							strokeDasharray="5 5"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartWrapper>
			<SummaryContainer>
				<SummaryTitle>11c: Refraction Angle vs. Frequency</SummaryTitle>
				<p>
					This graph shows the internal angle of refraction (φ) inside
					the water droplet at the point of minimum deviation (the
					rainbow angle). The colored line represents this angle for
					the primary rainbow. The dashed line represents the critical
					angle for a water-air interface. Because the refraction
					angle is always less than the critical angle, some light is
					always transmitted (leaks) out of the back of the droplet at
					each internal reflection. This is why the primary rainbow is
					brighter than the secondary, and why higher-order rainbows
					are almost never visible.
				</p>
			</SummaryContainer>
		</>
	);
};

const View11d = () => {
	const theme = useTheme();
	const canvasRef = useRef(null);
	const [solarElevation, setSolarElevation] = useState(20);

	const drawRainbow = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		const { width, height } = canvas.getBoundingClientRect();
		if (width === 0 || height === 0) return;
		canvas.width = width;
		canvas.height = height;

		const horizonY = height * 0.7;
		const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
		skyGradient.addColorStop(0, "#5D9CEC");
		skyGradient.addColorStop(1, "#AEC6CF");
		ctx.fillStyle = skyGradient;
		ctx.fillRect(0, 0, width, horizonY);
		ctx.fillStyle = "#2E7D32";
		ctx.fillRect(0, horizonY, width, height - horizonY);

		const antiSolarPointY =
			horizonY -
			Math.tan((solarElevation * Math.PI) / 180) * (width * 0.5);

		const freqStart = 405,
			freqEnd = 790;
		const rainbowData = [];
		for (let freq = freqStart; freq <= freqEnd; freq += 5) {
			const n = getWaterRefractiveIndex(freq);
			if (isNaN(n)) continue;
			const { primary_theta_deg, secondary_theta_deg } =
				findRainbowMinDeviation(n);
			const { primary_epsilon_deg } = calculateRainbowAngles(
				primary_theta_deg,
				n,
			);
			const { secondary_epsilon_deg } = calculateRainbowAngles(
				secondary_theta_deg,
				n,
			);
			rainbowData.push({
				p: primary_epsilon_deg,
				s: secondary_epsilon_deg,
				color: frequencyToColor(freq),
			});
		}

		const lineWidth = width > 500 ? 3 : 2;
		ctx.lineWidth = lineWidth;
		const arcCenterX = width / 2;

		// Draw primary and secondary bows band by band
		for (let i = 0; i < rainbowData.length; i++) {
			const d = rainbowData[i];

			// Primary
			if (!isNaN(d.p)) {
				ctx.strokeStyle = d.color;
				ctx.beginPath();
				const radiusP = Math.tan((d.p * Math.PI) / 180) * width;
				ctx.arc(
					arcCenterX,
					antiSolarPointY,
					radiusP,
					Math.PI,
					2 * Math.PI,
				);
				ctx.stroke();
			}

			// Secondary
			if (!isNaN(d.s)) {
				ctx.strokeStyle = d.color;
				ctx.beginPath();
				const radiusS = Math.tan((d.s * Math.PI) / 180) * width;
				ctx.arc(
					arcCenterX,
					antiSolarPointY,
					radiusS,
					Math.PI,
					2 * Math.PI,
				);
				ctx.stroke();
			}
		}
	}, [solarElevation, theme]);

	useEffect(() => {
		drawRainbow();
		window.addEventListener("resize", drawRainbow);
		return () => window.removeEventListener("resize", drawRainbow);
	}, [drawRainbow]);

	return (
		<>
			<ControlAndVizContainer>
				<Slider
					label="Solar Elevation Angle (α)"
					min={0}
					max={40}
					step={1}
					value={solarElevation}
					onChange={(e) =>
						setSolarElevation(parseFloat(e.target.value))
					}
					unit="°"
				/>
				<div
					style={{
						flex: 1,
						marginTop: "1rem",
						borderRadius: "8px",
						overflow: "hidden",
					}}>
					<Canvas ref={canvasRef} />
				</div>
			</ControlAndVizContainer>
			<SummaryContainer>
				<SummaryTitle>11d: Interactive Rainbow Simulator</SummaryTitle>
				<p>
					This simulation shows the appearance of a rainbow at sea
					level based on the elevation of the sun. The rainbow is
					always centered on the "anti-solar point"—the point directly
					opposite the sun. As the sun's elevation changes, this point
					moves up or down.
				</p>
				<p>
					When the sun is low on the horizon (α is small), the
					anti-solar point is high, and we see a large, high arc. As
					the sun rises, the rainbow gets lower. When the sun's
					elevation is greater than the rainbow angle itself (~42°),
					the top of the rainbow dips below the horizon, and it is no
					longer visible from the ground.
				</p>
			</SummaryContainer>
		</>
	);
};

export default Task11;
