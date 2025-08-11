// src/pages/Task12.js
import React, { useState, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import {
	getCrownGlassRefractiveIndex,
	frequencyToColor,
	calculatePrismPath,
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
const TwoColumnLayout = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 2rem;
	align-items: stretch;
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
const WarningText = styled.p`
	color: #f39c12;
	font-weight: 500;
	margin-top: 1rem;
	padding: 0.75rem;
	background: rgba(243, 156, 18, 0.1);
	border-radius: 6px;
	border-left: 3px solid #f39c12;
`;
const PrismSVG = styled.svg`
	width: 100%;
	height: 100%;
	border-radius: 8px;
`;

const Task12 = () => {
	const theme = useTheme();
	const [apexAngle, setApexAngle] = useState(60);
	const [incidenceAngle, setIncidenceAngle] = useState(48);

	const { rayPaths, tirOccurred, prismPoints } = useMemo(() => {
		const alpha_rad = (apexAngle * Math.PI) / 180;
		const prismHeight = 1.0;
		const prismHalfBase = Math.tan(alpha_rad / 2) * prismHeight;
		const p_top = { x: 0, y: prismHeight / 2 };
		const p_left = { x: -prismHalfBase, y: -prismHeight / 2 };
		const p_right = { x: prismHalfBase, y: -prismHeight / 2 };

		const paths = [];
		let tir = false;

		for (let i = 0; i < 100; i++) {
			const freq = 405 + (i / 99) * (790 - 405);
			const wavelength = 299792.458 / freq;
			const n = getCrownGlassRefractiveIndex(wavelength);
			const result = calculatePrismPath(incidenceAngle, apexAngle, n);

			if (result.tir) {
				tir = true;
			} else {
				paths.push({ ...result, color: frequencyToColor(freq) });
			}
		}
		return {
			rayPaths: paths,
			tirOccurred: tir,
			prismPoints: [p_left, p_top, p_right],
		};
	}, [apexAngle, incidenceAngle]);

	return (
		<TaskContainer>
			<Title>Task 12: Dynamic Model of a Triangular Prism</Title>
			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Prism & Light Source Controls
					</h3>
					<Slider
						label="Prism Apex Angle (α)"
						min={30}
						max={90}
						step={1}
						value={apexAngle}
						onChange={(e) =>
							setApexAngle(parseFloat(e.target.value))
						}
						unit="°"
					/>
					<Slider
						label="Angle of Incidence (θi)"
						min={0}
						max={90}
						step={1}
						value={incidenceAngle}
						onChange={(e) =>
							setIncidenceAngle(parseFloat(e.target.value))
						}
						unit="°"
					/>
					{tirOccurred && (
						<WarningText>
							Total Internal Reflection! Some or all of the light
							cannot exit the prism.
						</WarningText>
					)}
				</ControlAndVizContainer>

				<ControlAndVizContainer>
					<PrismSVG viewBox="-1.5 -1.5 3 3">
						<g transform="rotate(-90)">
							<Prism prismPoints={prismPoints} theme={theme} />
							{rayPaths.map((path, i) => (
								<Ray
									key={i}
									path={path}
									apexAngle={apexAngle}
									prismPoints={prismPoints}
									theme={theme}
									isWhiteRay={i === 0}
								/>
							))}
						</g>
					</PrismSVG>
				</ControlAndVizContainer>
			</TwoColumnLayout>
			<SummaryContainer>
				<SummaryTitle>
					Analysis: Dispersion through a Prism
				</SummaryTitle>
				<p>
					This simulation models what happens when a beam of white
					light, composed of many colors, passes through a glass
					prism. The phenomenon is called <strong>dispersion</strong>.
				</p>
				<ul>
					<li>
						<strong>Refraction:</strong> As light enters the prism,
						it slows down and bends (refracts). It bends again when
						it exits. The amount of bending is determined by Snell's
						Law and the prism's refractive index.
					</li>
					<li>
						<strong>Dispersion:</strong> The refractive index of
						glass is slightly different for each color of light (as
						seen in Task 1). Violet light (higher frequency) has a
						higher refractive index and therefore bends *more* than
						red light (lower frequency). This difference in bending
						causes the white light to split into its constituent
						colors, forming a spectrum.
					</li>
					<li>
						<strong>Total Internal Reflection (TIR):</strong> Under
						certain conditions (typically a large apex angle and a
						shallow angle of incidence), the light ray may strike
						the second internal face of the prism at an angle so
						great that it cannot exit, and is reflected internally
						instead. When this happens, no rainbow is formed on the
						exit side.
					</li>
				</ul>
			</SummaryContainer>
		</TaskContainer>
	);
};

const Prism = React.memo(({ prismPoints, theme }) => {
	const { p_left, p_top, p_right } = prismPoints;
	return (
		<path
			d={`M ${p_left.x} ${p_left.y} L ${p_top.x} ${p_top.y} L ${p_right.x} ${p_right.y} Z`}
			fill={theme.primary}
			fillOpacity="0.1"
			stroke={theme.line}
			strokeWidth="0.02"
		/>
	);
});

const Ray = React.memo(
	({ path, apexAngle, prismPoints, theme, isWhiteRay }) => {
		const { theta_i_deg, beta_deg, theta_t_deg } = path;
		const { p_left, p_top, p_right } = prismPoints;

		// Convert all angles to radians for calculation
		const theta_i_rad = (theta_i_deg * Math.PI) / 180;
		const beta_rad = (beta_deg * Math.PI) / 180;
		const theta_t_rad = (theta_t_deg * Math.PI) / 180;
		const alpha_rad = (apexAngle * Math.PI) / 180;

		// 1. Calculate entry point by intersecting incident ray with left face of prism
		const m_left_face = (p_top.y - p_left.y) / (p_top.x - p_left.x);
		const c_left_face = p_top.y - m_left_face * p_top.x;
		const m_incident = Math.tan(theta_i_rad);
		const c_incident = 0; // Ray passes through origin of local coordinate system
		const entryX = (c_left_face - c_incident) / (m_incident - m_left_face);
		const entryY = m_incident * entryX + c_incident;

		// Ray source point (for visualization)
		const sourcePoint = {
			x: entryX - 2 * Math.cos(theta_i_rad),
			y: entryY - 2 * Math.sin(theta_i_rad),
		};

		// 2. Calculate exit point by intersecting internal ray with right face
		const internalAngle = beta_rad - alpha_rad / 2;
		const m_internal = Math.tan(internalAngle);
		const c_internal = entryY - m_internal * entryX;
		const m_right_face = (p_right.y - p_top.y) / (p_right.x - p_top.x);
		const c_right_face = p_top.y - m_right_face * p_top.x;
		const exitX = (c_right_face - c_internal) / (m_internal - m_right_face);
		const exitY = m_internal * exitX + c_internal;

		// 3. Calculate final end point of the exiting ray
		const exitAngle = theta_t_rad - alpha_rad / 2;
		const endPoint = {
			x: exitX + 2 * Math.cos(exitAngle),
			y: exitY + 2 * Math.sin(exitAngle),
		};

		// This check prevents "impossible" rays from drawing if calculations are at an edge case
		if (isNaN(exitX) || isNaN(exitY)) return null;

		return (
			<g transform={`rotate(${90 - apexAngle / 2})`}>
				{" "}
				{/* Rotate entire system for correct orientation */}
				{isWhiteRay && (
					<line
						x1={sourcePoint.x}
						y1={sourcePoint.y}
						x2={entryX}
						y2={entryY}
						stroke={theme.text}
						strokeWidth="0.02"
					/>
				)}
				<line
					x1={entryX}
					y1={entryY}
					x2={exitX}
					y2={exitY}
					stroke={path.color}
					strokeWidth="0.005"
				/>
				<line
					x1={exitX}
					y1={exitY}
					x2={endPoint.x}
					y2={endPoint.y}
					stroke={path.color}
					strokeWidth="0.01"
				/>
			</g>
		);
	},
);

export default Task12;
