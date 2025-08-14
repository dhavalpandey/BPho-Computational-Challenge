// src/pages/Task6.js
import React, { useState, useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { thinLensTransform } from "../utils/physics";

// --- Styled Components (Reverted to standard compact layout) ---
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

const Task6 = () => {
	const theme = useTheme();
	const [objectX, setObjectX] = useState(1.5);
	const [objectY, setObjectY] = useState(0.5);
	const [objectWidth, setObjectWidth] = useState(0.5);
	const [focalLength, setFocalLength] = useState(1.0);

	const lensTransform = useCallback(
		(point) => {
			const transformed = thinLensTransform(point, focalLength);
			if (transformed.x > 0) {
				// Filter for real images which have a negative transformed x
				return { x: NaN, y: NaN };
			}
			return transformed;
		},
		[focalLength],
	);

	const lens = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(originX, 0);
			ctx.lineTo(originX, originY * 2);
			ctx.stroke();
		},
	};

	const isRealImageFormed = objectX > focalLength;

	const { v, M } = useMemo(() => {
		if (objectX === focalLength) return { v: Infinity, M: Infinity };
		const v_calc = 1 / (1 / focalLength - 1 / objectX);
		const M_calc = -v_calc / objectX;
		return { v: v_calc, M: M_calc };
	}, [objectX, focalLength]);

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
						label="Object Distance (u)"
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
					(biconvex) lens. A real image is formed where light rays
					from an object physically converge. This phenomenon is the
					basis for projectors and cameras. For a simple thin lens,
					this occurs when the object distance 'u' is greater than the
					focal length 'f'.
				</p>
				<Equation>1/u + 1/v = 1/f</Equation>
				<p>
					The position of the image (v) and its magnification (M) are
					determined by the thin lens and magnification equations.
					Based on the current parameters:
				</p>
				<ul>
					<li>
						Object Distance (u):{" "}
						<ResultValue>{objectX.toFixed(2)} m</ResultValue>
					</li>
					<li>
						Image Distance (v):{" "}
						<ResultValue>
							{isRealImageFormed ? v.toFixed(2) : "N/A"} m
						</ResultValue>
					</li>
					<li>
						Magnification (M):{" "}
						<ResultValue>
							{isRealImageFormed ? M.toFixed(2) : "N/A"}
						</ResultValue>
					</li>
				</ul>
				<p>
					A negative magnification indicates the image is inverted. A
					magnification with an absolute value greater than 1 means
					the image is enlarged; less than 1 means it is reduced.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task6;
