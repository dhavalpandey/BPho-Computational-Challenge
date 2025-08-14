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

// Keep using your existing physics.js for 11a/11b:
import {
	getWaterRefractiveIndex,
	frequencyToColor,
	calculateRainbowAngles,
	findRainbowMinDeviation,
} from "../utils/physics";

// NEW: task-specific robust maths for 11c/11d only
import { findMinimaDeg, sampleRainbowAngles } from "../utils/task11_physics";

// --- Styled Components (consistent) ---
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
					{activeTab === "11c" && <View11c />} {/* FIXED */}
					{activeTab === "11d" && <View11d />} {/* FIXED */}
				</motion.div>
			</AnimatePresence>
		</TaskContainer>
	);
};

// --- 11a (unchanged logic) ---
const View11a = () => {
	const theme = useTheme();
	const data = useMemo(() => {
		const points = [];
		const colors = { Red: 442.5, Green: 565, Blue: 650 };
		for (let i = 0; i <= 900; i++) {
			const theta = i / 10;
			const point = { theta };
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
					This graph shows the exit elevation ε of a ray from a water
					droplet as a function of the incident angle θ. The flat
					regions correspond to the rainbow concentrations: many θ
					values yield almost the same ε.
				</p>
			</SummaryContainer>
		</>
	);
};

// --- 11b (unchanged logic) ---
const View11b = () => {
	const theme = useTheme();
	const data = useMemo(() => {
		return Array.from({ length: 193 }, (_, i) => {
			const frequency = 405 + i * 2;
			const n = getWaterRefractiveIndex(frequency);
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
				frequency,
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
								id="g11b_primary"
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
								id="g11b_secondary"
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
							stroke="url(#g11b_primary)"
							strokeWidth={8}
							dot={false}
							name="Primary Rainbow"
						/>
						<Line
							type="monotone"
							dataKey="secondaryAngle"
							stroke="url(#g11b_secondary)"
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
					Dispersion causes a small shift in ε with colour: red
					(~42.5°) to violet (~40.9°) for the primary; the secondary
					is reversed and at a larger angle.
				</p>
			</SummaryContainer>
		</>
	);
};

// --- 11c (FIXED): Refraction Angle φ at Minimum Deviation vs Frequency ---
const View11c = () => {
	const theme = useTheme();

	// Build a single clean dataset
	const data = useMemo(() => {
		const arr = [];
		for (let f = 405; f <= 790; f += 2) {
			const n = getWaterRefractiveIndex(f);
			if (!isFinite(n)) continue;
			const { primary, critical_deg } = findMinimaDeg(n); // robust search
			arr.push({
				frequency: f,
				phiPrimary: primary.phi_deg, // internal refraction φ at min deviation
				critical: critical_deg, // water→air critical angle
			});
		}
		return arr;
	}, []);

	// Build a gradient for colouring φ by frequency (to match 11b)
	const gradStops = useMemo(() => {
		return data.map((d) => ({
			off: ((d.frequency - 405) / (790 - 405)) * 100,
			col: frequencyToColor(d.frequency),
		}));
	}, [data]);

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
								value: "Refraction Angle φ (°, inside water)",
								angle: -90,
								position: "insideLeft",
								offset: -10,
								fill: theme.text,
							}}
						/>
						<Tooltip
							formatter={(value, name) => {
								const label =
									name === "phiPrimary"
										? "φ at min deviation"
										: "Critical angle";
								return [`${value.toFixed(2)}°`, label];
							}}
							labelFormatter={(freq) => `Frequency: ${freq} THz`}
							contentStyle={{
								backgroundColor: theme.accent,
								border: `1px solid ${theme.line}`,
							}}
						/>
						<Legend wrapperStyle={{ paddingTop: "20px" }} />
						<defs>
							<linearGradient
								id="g11c_phi"
								x1="0"
								y1="0"
								x2="1"
								y2="0">
								{gradStops.map((s, i) => (
									<stop
										key={i}
										offset={`${s.off}%`}
										stopColor={s.col}
									/>
								))}
							</linearGradient>
						</defs>
						<Line
							type="monotone"
							dataKey="phiPrimary"
							name="φ at min deviation"
							stroke="url(#g11c_phi)"
							strokeWidth={4}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="critical"
							name="Critical angle"
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
					The internal refraction angle φ at the primary rainbow’s
					minimum deviation is always below the water–air critical
					angle, so light escapes at the final interface. This, along
					with fewer internal reflections, explains why the primary is
					brighter than the secondary.
				</p>
			</SummaryContainer>
		</>
	);
};

const View11d = () => {
	const theme = useTheme();
	const canvasRef = useRef(null);
	const [solarElevation, setSolarElevation] = useState(20); // α in degrees (sun above horizon)

	const drawRainbow = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d", { alpha: true });

		// HiDPI-safe sizing
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const rect = canvas.getBoundingClientRect();
		const W = Math.max(1, Math.floor(rect.width));
		const H = Math.max(1, Math.floor(rect.height));
		canvas.width = Math.floor(W * dpr);
		canvas.height = Math.floor(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// ---------- Scene layout ----------
		const horizonY = Math.round(H * 0.7); // sea-level horizon
		// Sky + sea
		const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
		sky.addColorStop(0, "#5D9CEC");
		sky.addColorStop(1, "#AEC6CF");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, W, horizonY);
		ctx.fillStyle = "#2E7D32";
		ctx.fillRect(0, horizonY, W, H - horizonY);

		// ---------- Anti-solar centre (sea-level, no topography) ----------
		// Anti-solar elevation = −α → centre is α degrees *below* the horizon.
		const MAX_SECONDARY_EPS = 56; // deg (safe cap for radius)
		const PAD_TOP = 12,
			PAD_SIDE = 16;
		// Degree→pixel scale so the largest circle fits within sky & width
		const deg2px = Math.max(
			1,
			Math.min(
				(horizonY - PAD_TOP) / MAX_SECONDARY_EPS,
				(W / 2 - PAD_SIDE) / MAX_SECONDARY_EPS,
			),
		);
		const cx = Math.round(W / 2);
		const cy = Math.round(horizonY + solarElevation * deg2px); // below horizon by α

		// ---------- Rainbow angles across spectrum ----------
		// Uses task11_physics helpers (robust minima). We keep both primary & secondary.
		const bands = sampleRainbowAngles(getWaterRefractiveIndex, 405, 790, 5);
		// Guard: if something odd happens, bail gracefully
		if (!bands.length) {
			// Horizon line
			ctx.strokeStyle = theme.line;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, horizonY + 0.5);
			ctx.lineTo(W, horizonY + 0.5);
			ctx.stroke();
			return;
		}

		// Convert elevation ε (deg) → radius (px) about anti-solar centre.
		const toRadiusPx = (epsDeg) => {
			if (!isFinite(epsDeg) || epsDeg <= 0) return null; // ε must be positive
			return epsDeg * deg2px;
		};

		// Visibility: a bow is visible only if its apex is above the horizon:
		// apex elevation = ε − α. Use a tiny tolerance to avoid flicker at threshold.
		const visible = (epsDeg) =>
			isFinite(epsDeg) && epsDeg - solarElevation > 0.1;

		// ---------- Draw only the sky portion (above horizon) ----------
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, W, horizonY);
		ctx.clip();

		ctx.lineWidth = W > 600 ? 3 : 2;

		// Helper to draw a full circle (clipped to sky). We draw *full* circles
		// and let the clip reveal only the physically visible arc above the horizon.
		const drawCircle = (r, strokeStyle, dashed = false) => {
			if (!isFinite(r) || r <= 0) return;
			ctx.setLineDash(dashed ? [8, 8] : []);
			ctx.strokeStyle = strokeStyle;
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
			ctx.stroke();
			if (dashed) ctx.setLineDash([]);
		};

		// --- PRIMARY (solid) ---
		// Draw in frequency order (violet→red or vice versa is fine; radius encodes order).
		for (const s of bands) {
			if (!visible(s.eps1)) continue;
			const r1 = toRadiusPx(s.eps1);
			drawCircle(r1, frequencyToColor(s.f), false);
		}

		// --- SECONDARY (dashed) ---
		// To make it unmistakable, draw it after primary and slightly thicker.
		ctx.lineWidth = (W > 600 ? 3 : 2) + 1;
		// Draw frequencies in reverse so radial layering looks crisp on the outer bow.
		for (let i = bands.length - 1; i >= 0; i--) {
			const s = bands[i];
			if (!visible(s.eps2)) continue;
			const r2 = toRadiusPx(s.eps2);
			drawCircle(r2, frequencyToColor(s.f), true);
		}

		ctx.restore();

		// Horizon line (repaint after clipping to keep it crisp)
		ctx.strokeStyle = theme.line;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, horizonY + 0.5);
		ctx.lineTo(W, horizonY + 0.5);
		ctx.stroke();

		// Labels at the bow apices (optional but helpful to verify both bows)
		const label = (text, epsDeg, yOffset = -8) => {
			if (!visible(epsDeg)) return;
			const r = toRadiusPx(epsDeg);
			if (!r) return;
			ctx.fillStyle = theme.text;
			ctx.font = `12px ${theme.font || "system-ui"}`;
			ctx.textAlign = "center";
			// Apex (top) of a circle about (cx, cy) is at angle -π/2 → (cx, cy - r)
			ctx.fillText(text, cx, cy - r + yOffset);
		};
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
					At sea level, the rainbow is part of a circle centred on the
					anti-solar point, which is <em>α</em> degrees below the
					horizon. The bright bow occurs at angular radius <em>ε</em>{" "}
					from that centre (≈42° primary; ≈51–54° secondary). We draw
					both: the <strong>primary</strong> as a solid, inner bow and
					the <strong>secondary</strong> as a dashed, larger bow. Only
					the sky-visible arc (above the horizon) is shown. As the Sun
					rises, less of each circle lies above the horizon; when{" "}
					<em>α ≥ ε</em>, that bow disappears.
				</p>
			</SummaryContainer>
		</>
	);
};

export default Task11;
