// src/pages/Task7.js
import React, { useState, useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import ImageTransformViewer from "../components/ImageTransformViewer";
import { thinLensTransform } from "../utils/physics";

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
	/* FIX: Change to a 1/3 to 2/3 ratio for the columns */
	grid-template-columns: 1fr 2fr;
	gap: 2rem;
	align-items: stretch;

	@media (max-width: 900px) {
		grid-template-columns: 1fr; /* Stack on smaller screens */
	}
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
const WarningText = styled.p`...`; // Unchanged
const ResultValue = styled.span`...`; // Unchanged
const Equation = styled.div`...`; // Unchanged

const Task7 = () => {
	const theme = useTheme();
	const [objectX, setObjectX] = useState(0.65);
	const [objectY, setObjectY] = useState(0);
	const [objectWidth, setObjectWidth] = useState(0.25);
	const [focalLength, setFocalLength] = useState(1.05);

	const lensTransform = useCallback(
		(point) => {
			const transformed = thinLensTransform(point, focalLength);
			if (transformed.x < 0) {
				// Filter for virtual images (v < 0 => transformed.x > 0)
				return { x: NaN, y: NaN };
			}
			return transformed;
		},
		[focalLength],
	);

	const lens = {
		draw: (ctx, scale, originX, originY) => {
			ctx.strokeStyle = theme.primary;
			ctx.lineWidth = 4; // Make lens slightly thicker
			ctx.beginPath();
			// Draw the lens at x=0 in our coordinate system
			ctx.moveTo(originX, 0);
			ctx.lineTo(originX, originY * 2);
			ctx.stroke();
		},
	};

	const isVirtualImageFormed = objectX < focalLength && objectX > 0;

	const { v, M } = useMemo(() => {
		if (objectX === focalLength) return { v: -Infinity, M: Infinity };
		const v_calc = 1 / (1 / focalLength - 1 / objectX);
		const M_calc = -v_calc / objectX;
		return { v: v_calc, M: M_calc };
	}, [objectX, focalLength]);

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
					{!isVirtualImageFormed && (
						<WarningText>
							Object is at or outside the focal length (u ≥ f). A
							virtual image is not formed.
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
				<Equation>1/u + 1/v = 1/f</Equation>
				<p>
					The key characteristics of this virtual image are calculated
					below:
				</p>
				<ul>
					<li>
						Object Distance (u):{" "}
						<ResultValue>{objectX.toFixed(2)} m</ResultValue>
					</li>
					<li>
						Image Distance (v):{" "}
						<ResultValue>
							{isVirtualImageFormed ? v.toFixed(2) : "N/A"} m
						</ResultValue>{" "}
						(Negative `v` indicates a virtual image on the same side
						as the object).
					</li>
					<li>
						Magnification (M):{" "}
						<ResultValue>
							{isVirtualImageFormed ? M.toFixed(2) : "N/A"}
						</ResultValue>{" "}
						(Positive `M` indicates an upright image).
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
