// src/pages/Task9.js
import React, { useState, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { convexMirrorPixelTransform } from "../utils/task9_physics";

// --- Styled Components (consistent with other tasks) ---
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

const Equation = styled.div`
	margin: 1rem 0;
	padding: 1rem;
	background: ${({ theme }) => theme.body};
	border-radius: 6px;
	text-align: center;
	font-family: "Courier New", Courier, monospace;
	font-size: 1.1rem;
	overflow-x: auto;
`;

const Task9 = () => {
	const theme = useTheme();

	// Default values chosen so the result resembles the sheet (object on y≈0).
	const [objectX, setObjectX] = useState(1.8);
	const [objectY, setObjectY] = useState(0.0);
	const [objectWidth, setObjectWidth] = useState(0.8);
	const [mirrorRadius, setMirrorRadius] = useState(1.0);

	const mirrorTransform = useCallback(
		(point) => convexMirrorPixelTransform(point, mirrorRadius),
		[mirrorRadius],
	);

	// Mirror: draw LEFT semicircle so the edge points RIGHT (as in the BPhO sheet).
	const convexMirror = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary;
			ctx.lineWidth = 4;
			ctx.beginPath();
			const r = mirrorRadius * scale;
			// Canvas is y-down; to draw the LEFT arc we go from +π/2 to -π/2 anticlockwise.
			ctx.arc(originX, originY, r, Math.PI / 2, -Math.PI / 2, true);
			ctx.stroke();
		},
	};

	return (
		<TaskContainer>
			<Title>Task 9: Virtual Image from a Convex Spherical Mirror</Title>
			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Mirror &amp; Object Controls
					</h3>

					<Slider
						label="Mirror Radius (R)"
						min={0.5}
						max={1.25}
						step={0.05}
						value={mirrorRadius}
						onChange={(e) =>
							setMirrorRadius(parseFloat(e.target.value))
						}
						unit="m"
					/>

					<Slider
						label="Object X Position"
						min={1}
						max={2.0}
						step={0.01}
						value={objectX}
						onChange={(e) => setObjectX(parseFloat(e.target.value))}
						unit="m"
					/>

					<Slider
						label="Object Y Position"
						min={-1}
						max={1}
						step={0.01}
						value={objectY}
						onChange={(e) => setObjectY(parseFloat(e.target.value))}
						unit="m"
					/>

					<Slider
						label="Object Size"
						min={0.1}
						max={1.0}
						step={0.01}
						value={objectWidth}
						onChange={(e) =>
							setObjectWidth(parseFloat(e.target.value))
						}
					/>
				</ControlAndVizContainer>

				<ControlAndVizContainer style={{ padding: 0 }}>
					<ImageTransformViewer
						objectPosition={{ x: objectX, y: objectY }}
						objectSize={{ w: objectWidth, h: objectWidth }}
						transformation={mirrorTransform}
						mirror={convexMirror}
					/>
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>
					Analysis: Convex Mirror Virtual Image
				</SummaryTitle>
				<p>
					This model applies the closed-form mapping from the BPhO
					sheet to each source pixel. The convex surface causes rays
					to diverge; the backward extensions intersect at a{" "}
					<em>virtual</em> point behind the mirror.
				</p>
				<Equation>
					Image (X,Y) = Transform(Object (x,y), Radius R)
				</Equation>
				<ul>
					<li>
						<strong>Virtual:</strong> Appears behind the mirror
						(inside the arc).
					</li>
					<li>
						<strong>Upright:</strong> Sign(Y) = Sign(y); radial
						alignment preserved.
					</li>
					<li>
						<strong>Minified &amp; Distorted:</strong> Magnitude
						shrinks; distortion rises near the rim.
					</li>
				</ul>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task9;
