// src/pages/Task7.js
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { convergingLensVirtualImage } from "../utils/physics";

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

const Task7 = () => {
	const [objectX, setObjectX] = useState(0.5); // Default INSIDE focal length
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);
	const [focalLength, setFocalLength] = useState(1.0);

	const lensTransform = useCallback(
		(point) => {
			return convergingLensVirtualImage(point, focalLength);
		},
		[focalLength],
	);

	const lens = {
		start: (scale, originX, originY) => ({ x: originX, y: 0 }),
		end: (scale, originX, originY) => ({ x: originX, y: originY * 2 }),
	};

	const isVirtualImageFormed = objectX < focalLength && objectX > 0;

	return (
		<TaskContainer>
			<Title>Task 7: Virtual, Enlarged Image from a Thin Lens</Title>

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
					{!isVirtualImageFormed && (
						<WarningText>
							Object is outside the focal length (u ≥ f). A
							virtual image is not formed. (See Task 6 for the
							real image).
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
					Analysis: Converging Lens - Virtual Image (Magnifying Glass)
				</SummaryTitle>
				<p>
					This simulation models how a magnifying glass works. When an
					object is placed <strong>inside the focal length</strong> of
					a converging lens, the light rays exiting the lens diverge.
					The human brain traces these diverging rays back to an
					apparent point of origin, creating a{" "}
					<strong>virtual image</strong>.
				</p>
				<p>The key characteristics of this virtual image are:</p>
				<ul>
					<li>
						<strong>Upright:</strong> The image is the same
						orientation as the object.
					</li>
					<li>
						<strong>Virtual:</strong> It appears on the same side of
						the lens as the object. Light does not actually converge
						here.
					</li>
					<li>
						<strong>Enlarged:</strong> The image is larger than the
						object. The magnification becomes greater as the object
						moves closer to the focal point.
					</li>
				</ul>
				<p>
					Drag the sliders to see what happens. If you move the object
					outside the focal length, the virtual image disappears, and
					a real image would be formed on the other side of the lens
					(as shown in Task 6).
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task7;
