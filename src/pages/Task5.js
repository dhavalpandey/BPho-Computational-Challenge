// src/pages/Task5.js
import React, { useState, useCallback } from "react";
import styled, { useTheme } from "styled-components";
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

const ResultValue = styled.span`
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	background-color: ${({ theme }) => theme.line};
	padding: 2px 6px;
	border-radius: 4px;
	font-family: "Courier New", Courier, monospace;
`;

const Equation = styled.div`
	margin: 1rem 0;
	padding: 1rem;
	background: ${({ theme }) => theme.body};
	border-radius: 6px;
	text-align: center;
	font-family: "Courier New", Courier, monospace;
	font-size: 1.1rem;
`;

const Task5 = () => {
	const theme = useTheme();
	const [objectX, setObjectX] = useState(0.5);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);

	const planeMirrorTransform = useCallback(
		({ x, y }) => ({ x: -x, y: y }),
		[],
	);

	const mirror = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(originX, 0);
			ctx.lineTo(originX, originY * 2);
			ctx.stroke();
		},
	};

	const virtualImageX = -objectX;
	const magnification = 1;

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
						unit="m"
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
					by a plane mirror. A virtual image is an image that appears
					at a location where light does not actually converge. The
					brain perceives an image at this location because it assumes
					that light rays travel in straight lines.
				</p>
				<Equation>x' = -x &nbsp;&nbsp; | &nbsp;&nbsp; y' = y</Equation>
				<p>
					The transformation is computationally simple: for any point
					(x, y) on the object, the corresponding image point (x', y')
					has an inverted x-coordinate. This leads to several key
					properties:
				</p>
				<ul>
					<li>
						The image is **virtual** (it appears behind the mirror).
					</li>
					<li>The image is **upright** (not inverted vertically).</li>
					<li>
						The image is **laterally inverted** (left-to-right is
						flipped).
					</li>
					<li>
						The image distance is equal to the object distance: |x'|
						= |x|. Currently, Object Distance ={" "}
						<ResultValue>{objectX.toFixed(2)} m</ResultValue> and
						Image Distance ={" "}
						<ResultValue>
							{Math.abs(virtualImageX).toFixed(2)} m
						</ResultValue>
						.
					</li>
					<li>
						The magnification is exactly{" "}
						<ResultValue>+{magnification.toFixed(1)}</ResultValue>,
						meaning the image is the same size as the object.
					</li>
				</ul>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task5;
