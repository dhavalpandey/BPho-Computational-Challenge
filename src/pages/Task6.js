// src/pages/Task6.js
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { convergingLensRealImage } from "../utils/physics";

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

const Task6 = () => {
	const [objectX, setObjectX] = useState(1.5);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);
	const [focalLength, setFocalLength] = useState(1.0);

	const lensTransform = useCallback(
		(point) => {
			return convergingLensRealImage(point, focalLength);
		},
		[focalLength],
	);

	const lens = {
		start: (scale, originX, originY) => ({ x: originX, y: 0 }),
		end: (scale, originX, originY) => ({ x: originX, y: originY * 2 }),
	};

	const isRealImageFormed = objectX > focalLength;

	return (
		<TaskContainer>
			<Title>Task 6: Real, Inverted Image from a Thin Lens</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Lens & Object Controls
					</h3>
					<Slider
						label="Focal Length (f)"
						min={0.2}
						max={2.0}
						step={0.05}
						value={focalLength}
						onChange={(e) =>
							setFocalLength(parseFloat(e.target.value))
						}
						unit="m"
					/>
					<Slider
						label="Object X Position (u)"
						min={0.1}
						max={3.0}
						step={0.05}
						value={objectX}
						onChange={(e) => setObjectX(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Object Y Position"
						min={-1.5}
						max={1.5}
						step={0.05}
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
					{!isRealImageFormed && (
						<WarningText>
							Object is inside the focal length (u ≤ f). No real
							image is formed.
						</WarningText>
					)}
				</ControlAndVizContainer>

				<ControlAndVizContainer style={{ padding: 0 }}>
					<ImageTransformViewer
						objectPosition={{ x: objectX, y: objectY }}
						objectSize={{ w: objectWidth, h: objectWidth }}
						transformation={lensTransform}
						mirror={lens}
					/>
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>
					Analysis: Converging Lens - Real Image
				</SummaryTitle>
				<p>
					This simulation shows the formation of a{" "}
					<strong>real, inverted image</strong> by a converging
					(biconvex) lens. A real image is formed when light rays from
					an object actually converge at a new point in space. This
					only occurs when the object is placed{" "}
					<strong>outside the focal length</strong> of the lens (i.e.,
					when the object's distance 'u' is greater than the focal
					length 'f').
				</p>
				<p>
					The image is calculated pixel-by-pixel using the thin lens
					coordinate transformation equations. Key characteristics of
					this image are:
				</p>
				<ul>
					<li>
						<strong>Inverted:</strong> The image is upside down
						relative to the object.
					</li>
					<li>
						<strong>Real:</strong> It forms on the opposite side of
						the lens from the object.
					</li>
					<li>
						<strong>Distortion:</strong> The image is not uniformly
						scaled. Parts of the object further from the lens axis
						are magnified differently, causing the characteristic
						lens distortion visible in the rendering.
					</li>
				</ul>
				<p>
					Use the sliders to adjust the parameters and observe these
					principles in action.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task6;
