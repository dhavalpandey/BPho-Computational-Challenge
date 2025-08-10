import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const NavContainer = styled.nav`
	padding: 0.75rem 2rem;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
	border-bottom: 1px solid ${({ theme }) => theme.line};
	position: sticky;
	top: 0;
	background: ${({ theme }) => theme.accent};
	backdrop-filter: saturate(180%) blur(20px);
	-webkit-backdrop-filter: saturate(180%) blur(20px);
	z-index: 1000;
`;

const StyledNavLink = styled(NavLink)`
	text-decoration: none;
	color: ${({ theme }) => theme.text};
	font-weight: 500;
	font-size: 14px;
	padding: 0.5rem 0.75rem;
	border-radius: 6px;
	position: relative;
	opacity: 0.8;
	transition: all 0.2s ease-in-out;

	&:hover {
		opacity: 1;
		background-color: ${({ theme }) => theme.line};
	}

	&.active {
		opacity: 1;
		color: #fff;
		background-color: ${({ theme }) => theme.primary};
	}
`;

const Navbar = () => {
	const tasks = Array.from({ length: 12 }, (_, i) => i + 1);

	return (
		<NavContainer>
			{tasks.map((taskNum) => (
				<StyledNavLink key={taskNum} to={`/task${taskNum}`}>
					Task {taskNum}
				</StyledNavLink>
			))}
		</NavContainer>
	);
};

export default Navbar;
