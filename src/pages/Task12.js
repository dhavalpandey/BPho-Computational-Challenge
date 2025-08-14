// src/pages/Task12.js
import React, { useState, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import {
	getCrownGlassRefractiveIndex,
	frequencyToColor,
} from "../utils/physics";
import { buildPrism, tracePrismRay } from "../utils/task12_physics";

// ---------- styled ----------
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

// ---------- small SVG helpers ----------
const PrismShape = React.memo(({ prism, theme }) => {
	const { p_left, p_top, p_right } = prism;
	return (
		<path
			d={`M ${p_left.x} ${p_left.y} L ${p_top.x} ${p_top.y} L ${p_right.x} ${p_right.y} Z`}
			fill={theme.primary}
			fillOpacity="0.08"
			stroke={theme.line}
			strokeWidth="0.02"
		/>
	);
});

const Ray = React.memo(({ segs, colour, theme, showIncident }) => {
	if (!segs) return null;
	const { source, entry, insideExit, outEnd } = segs;

	return (
		<g>
			{showIncident && source && entry && (
				<line
					x1={source.x}
					y1={source.y}
					x2={entry.x}
					y2={entry.y}
					stroke={theme.text}
					strokeOpacity="0.65"
					strokeWidth="0.02"
				/>
			)}
			{entry && insideExit && (
				<line
					x1={entry.x}
					y1={entry.y}
					x2={insideExit.x}
					y2={insideExit.y}
					stroke={colour}
					strokeWidth="0.02"
				/>
			)}
			{insideExit && outEnd && (
				<line
					x1={insideExit.x}
					y1={insideExit.y}
					x2={outEnd.x}
					y2={outEnd.y}
					stroke={colour}
					strokeWidth="0.02"
				/>
			)}
		</g>
	);
});

// ---------- main ----------
const Task12 = () => {
	const theme = useTheme();

	// Controls: α (apex) and θᵢ (to left-face TOP-LEFT normal)
	const [apexAngle, setApexAngle] = useState(60);
	const [incidenceAngle, setIncidenceAngle] = useState(40);

	// Build prism geometry
	const prism = useMemo(() => buildPrism(apexAngle, 1.0), [apexAngle]);

	// Trace a white beam: sample many frequencies, compute n(λ), refract through prism.
	const { rays, tirAny } = useMemo(() => {
		const paths = [];
		let tirFlag = false;

		for (let i = 0; i < 150; i++) {
			const fTHz = 405 + (i / 149) * (790 - 405); // THz
			const lambda_um = 299792.458 / fTHz; // μm
			const n = getCrownGlassRefractiveIndex(lambda_um); // expects μm
			if (!isFinite(n) || n <= 1) continue;

			const segs = tracePrismRay({
				prism,
				incidenceAngleDeg: incidenceAngle,
				nGlass: n,
				extent: 3.0, // long enough to ensure an obvious right-going exit
			});

			tirFlag = tirFlag || !!segs.tir;
			paths.push({ colour: frequencyToColor(fTHz), segs });
		}

		return { rays: paths, tirAny: tirFlag };
	}, [incidenceAngle, prism]);

	return (
		<TaskContainer>
			<Title>Task 12: Dynamic Model of a Triangular Prism</Title>
			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Prism &amp; Light Source Controls
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
						label="Angle of Incidence (θᵢ to left-face normal ↑↖)"
						min={0}
						max={85}
						step={1}
						value={incidenceAngle}
						onChange={(e) =>
							setIncidenceAngle(parseFloat(e.target.value))
						}
						unit="°"
					/>
					{tirAny && (
						<WarningText>
							Total internal reflection occurs for some
							wavelengths – those rays do not exit the prism.
						</WarningText>
					)}
				</ControlAndVizContainer>

				<ControlAndVizContainer>
					{/* y-up maths drawn with a single flip; wide viewBox so the right-origin beam is obvious */}
					<PrismSVG
						viewBox="-3.2 -1.8 6.8 3.6"
						preserveAspectRatio="xMidYMid meet">
						<g transform="scale(1,-1)">
							<PrismShape prism={prism} theme={theme} />
							{rays.map((r, idx) => (
								<Ray
									key={idx}
									segs={r.segs}
									colour={r.colour}
									theme={theme}
									showIncident={idx === 0}
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
					θᵢ is measured from the left-face normal that points towards
					the top-left, as requested. The incident beam is constructed
					so its source lies to the right of the prism, guaranteeing a
					right-origin, left-incident ray. Refraction at both
					interfaces uses Snell’s law with the normal automatically
					oriented into the incident medium to prevent sign mistakes.
					Colours fan out at the exit because the crown-glass
					refractive index increases slightly from red to violet.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task12;
