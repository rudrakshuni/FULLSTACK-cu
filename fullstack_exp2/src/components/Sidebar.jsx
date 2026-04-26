import styled from "styled-components";

const SidebarWrapper = styled.div`
  width: 220px;
  background-color: #1e1e2f;
  color: white;
  height: 100vh;
  padding: 20px;
`;

export default function Sidebar() {
  return (
    <SidebarWrapper>
      <h3>Menu</h3>
      <p>Home</p>
      <p>Analytics</p>
      <p>Settings</p>
    </SidebarWrapper>
  );
}
