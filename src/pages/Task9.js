// src/pages/Task9.js
import React, { useState, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { convexMirrorVirtualImage } from "../utils/physics";

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

const Task9 = () => {
	const theme = useTheme();
	const [objectX, setObjectX] = useState(1.0);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);
	const [mirrorRadius, setMirrorRadius] = useState(1.0);

	const mirrorTransform = useCallback(
		(point) => {
			return convexMirrorVirtualImage(point, mirrorRadius);
		},
		[mirrorRadius],
	);

	const convexMirror = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary;
			ctx.lineWidth = 3;
			ctx.beginPath();
			// An arc centered on the right, creating a convex shape on the left
			ctx.arc(
				originX + mirrorRadius * scale,
				originY,
				mirrorRadius * scale,
				Math.PI - Math.PI / 2.5,
				Math.PI + Math.PI / 2.5,
			);
			ctx.stroke();
		},
	};

	return (
		<TaskContainer>
			<Title>Task 9: Virtual Image from a Convex Spherical Mirror</Title>

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
						max={2.0}
						step={0.01}
						value={objectX}
						onChange={(e) => setObjectX(parseFloat(e.target.value))}
						unit="m"
					/>
					<Slider
						label="Object Y Position"
						min={-1.5}
						max={1.5}
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
					This simulation models the image formed by a convex mirror,
					often seen in security applications or on car passenger-side
					mirrors. These mirrors bulge outwards, providing a wider
					field of view.
				</p>
				<p>
					The image is generated using the coordinate transformations
					for convex spherical reflection. It has the following key
					characteristics:
				</p>
				<ul>
					<li>
						<strong>Virtual:</strong> The image appears to be
						located *behind* the mirror surface. The light rays only
						appear to diverge from this point.
					</li>
					<li>
						<strong>Upright:</strong> The image has the same
						orientation as the object.
					</li>
					<li>
						<strong>Minified & Distorted:</strong> The image is
						smaller than the object and becomes more distorted
						("fish-eye" effect) as the object gets closer to the
						mirror. This minification allows the mirror to reflect a
						much wider area.
					</li>
				</ul>
				<p>
					Use the sliders to manipulate the object's position and the
					mirror's curvature to see how the virtual image changes.
					Notice that the image is always upright and smaller than the
					object.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task9;
