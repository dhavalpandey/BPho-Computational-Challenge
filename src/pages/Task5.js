// src/pages/Task5.js
import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";

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
	min-height: 500px; // Ensure containers have a minimum height
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

const Task5 = () => {
	const [objectX, setObjectX] = useState(0.5);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);

	const planeMirrorTransform = ({ x, y }) => {
		return {
			x: -x,
			y: y,
		};
	};

	const mirror = {
		start: (scale, originX, originY) => ({ x: originX, y: 0 }),
		end: (scale, originX, originY) => ({ x: originX, y: originY * 2 }),
	};

	return (
		<TaskContainer>
			<Title>Task 5: Virtual Image in a Plane Mirror</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>Object Controls</h3>
					<Slider
						label="Object X Position"
						min={0.2}
						max={1.5}
						step={0.01}
						value={objectX}
						onChange={(e) => setObjectX(parseFloat(e.target.value))}
					/>
					<Slider
						label="Object Y Position"
						min={-1.5}
						max={1.5}
						step={0.01}
						value={objectY}
						onChange={(e) => setObjectY(parseFloat(e.target.value))}
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
						transformation={planeMirrorTransform}
						mirror={mirror}
					/>
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>Analysis: Plane Mirror Reflection</SummaryTitle>
				<p>
					This simulation demonstrates how a virtual image is formed
					by a plane mirror. The viewer on the right shows a real
					object (the cat) and its corresponding virtual image, which
					appears to be behind the mirror.
				</p>
				<p>
					The transformation is computationally simple: for any point
					(x, y) on the object, the corresponding point on the virtual
					image is (-x, y). The image is the same size as the object
					and appears to be the same distance behind the mirror as the
					object is in front of it.
				</p>
				<p>
					Use the sliders to move and resize the object and observe
					how the virtual image behaves exactly as you would expect
					from a real-world mirror.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task5;
