// src/pages/Task8.js
import React, { useState, useCallback } from "react";
import styled, { useTheme } from "styled-components"; // Import useTheme
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { concaveMirrorRealImage } from "../utils/physics";

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

const Task8 = () => {
	const theme = useTheme(); // FIX: Call useTheme hook here
	const [objectX, setObjectX] = useState(0.2);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.25);
	const [mirrorRadius, setMirrorRadius] = useState(1.0);

	const mirrorTransform = useCallback(
		(point) => {
			return concaveMirrorRealImage(point, mirrorRadius);
		},
		[mirrorRadius],
	);

	// FIX: Define the mirror object INSIDE the component, so it has access to `theme`
	const concaveMirror = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary; // Now 'theme' is defined
			ctx.lineWidth = 3;
			ctx.beginPath();
			// An arc centered at the radius distance from the origin
			ctx.arc(
				originX - mirrorRadius * scale,
				originY,
				mirrorRadius * scale,
				-Math.PI / 2.5,
				Math.PI / 2.5,
			);
			ctx.stroke();
		},
	};

	return (
		<TaskContainer>
			<Title>Task 8: Real Image from a Concave Spherical Mirror</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Mirror & Object Controls
					</h3>
					<Slider
						label="Mirror Radius (R)"
						min={0.5}
						max={2.0}
						step={0.05}
						value={mirrorRadius}
						onChange={(e) =>
							setMirrorRadius(parseFloat(e.target.value))
						}
						unit="m"
					/>
					<Slider
						label="Object X Position"
						min={0.1}
						max={0.8}
						step={0.01}
						value={objectX}
						onChange={(e) => setObjectX(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Object Y Position"
						min={-0.8}
						max={0.8}
						step={0.01}
						value={objectY}
						onChange={(e) => setObjectY(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Object Size"
						min={0.1}
						max={0.5}
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
						mirror={concaveMirror}
					/>
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>
					Analysis: The "Floating Cow" Experiment
				</SummaryTitle>
				<p>
					This simulation demonstrates the surprising formation of a{" "}
					<strong>real, inverted, and distorted image</strong> from a
					concave spherical mirror. This effect is often used in
					physics demonstrations (sometimes called the "flying cow" or
					"floating pig") where an object placed inside a mirrored
					bowl appears to float in space at the opening.
				</p>
				<p>
					The image is generated using the complex coordinate
					transformations for spherical reflection. Key
					characteristics are:
				</p>
				<ul>
					<li>
						<strong>Real:</strong> The image forms in front of the
						mirror, where light rays actually converge.
					</li>
					<li>
						<strong>Inverted:</strong> The image is upside down.
					</li>
					<li>
						<strong>Highly Distorted:</strong> The curvature of the
						mirror causes significant non-linear distortion,
						stretching and warping the image, especially as the
						object moves away from the center.
					</li>
				</ul>
				<p>
					Use the sliders to move the object around inside the
					mirror's curvature and observe how the real image changes
					its position, size, and distortion.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task8;
