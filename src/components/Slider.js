// src/components/Slider.js
import React from "react";
import styled from "styled-components";

const SliderContainer = styled.div`
	margin-bottom: 1.5rem;
`;

const LabelContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
	font-size: 0.9rem;
`;

const Label = styled.label`
	font-weight: 500;
	opacity: 0.9;
`;

const Value = styled.span`
	font-weight: 500;
	color: ${({ theme }) => theme.primary};
	font-family: "Courier New", Courier, monospace;
`;

const StyledSlider = styled.input`
	-webkit-appearance: none;
	width: 100%;
	height: 8px;
	background: ${({ theme }) => theme.line};
	border-radius: 5px;
	outline: none;
	transition: opacity 0.2s;

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: ${({ theme }) => theme.primary};
		cursor: pointer;
		border-radius: 50%;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 0 5px ${({ theme }) => theme.shadow};
	}

	&::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	&::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: ${({ theme }) => theme.primary};
		cursor: pointer;
		border-radius: 50%;
		transition: all 0.2s ease-in-out;
	}
`;

const Slider = ({ label, value, min, max, step, onChange, unit = "" }) => (
	<SliderContainer>
		<LabelContainer>
			<Label>{label}</Label>
			<Value>
				{value.toFixed(2)} {unit}
			</Value>
		</LabelContainer>
		<StyledSlider
			type="range"
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={onChange}
		/>
	</SliderContainer>
);

export default Slider;
