import React, { useState } from 'react';

// Canvas.jsx로부터 도형 및 텍스트 추가 함수를 props로 전달받습니다.
const Sidebar = ({ addRectangle, addCircle, addText }) => {
  // 현재 어떤 메뉴 탭이 열려있는지 관리 ('shape' 또는 'text')
  const [activeTab, setActiveTab] = useState('shape');

  return (
    <div style={sidebarContainerStyle}>
      {/* 왼쪽 아이콘 탭 바 (미리캔버스 가장 왼쪽 세로 바) */}
      <div style={tabBarStyle}>
        <button 
          onClick={() => setActiveTab('shape')} 
          style={{ ...tabButtonStyle, backgroundColor: activeTab === 'shape' ? '#e5e7eb' : 'transparent' }}
        >
          🟩<br/><span style={{ fontSize: '11px' }}>도형</span>
        </button>
        <button 
          onClick={() => setActiveTab('text')} 
          style={{ ...tabButtonStyle, backgroundColor: activeTab === 'text' ? '#e5e7eb' : 'transparent' }}
        >
          🔤<br/><span style={{ fontSize: '11px' }}>텍스트</span>
        </button>
      </div>

      {/* 탭 내용 보여주는 곳 (미리캔버스 리소스 패널) */}
      <div style={panelStyle}>
        {activeTab === 'shape' && (
          <>
            <h4 style={panelTitleStyle}>도형 레이어</h4>
            <button onClick={addRectangle} style={itemButtonStyle}>■ 사각형 추가</button>
            <button onClick={addCircle} style={itemButtonStyle}>● 원 추가</button>
          </>
        )}

        {activeTab === 'text' && (
          <>
            <h4 style={panelTitleStyle}>텍스트 레이어</h4>
            <button onClick={() => addText('제목을 입력하세요', 36, true)} style={itemButtonStyle}>
              <strong style={{ fontSize: '18px' }}>제목 텍스트 추가</strong>
            </button>
            <button onClick={() => addText('본문 내용을 입력하세요', 18, false)} style={itemButtonStyle}>
              <span style={{ fontSize: '14px' }}>본문 텍스트 추가</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// 스타일 시트
const sidebarContainerStyle = {
  width: '300px',
  display: 'flex',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e5e7eb',
  zIndex: 10,
};

const tabBarStyle = {
  width: '70px',
  borderRight: '1px solid #f3f4f6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '10px',
  gap: '8px',
};

const tabButtonStyle = {
  width: '55px',
  height: '55px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'center',
  fontWeight: 'bold',
  color: '#4b5563',
  transition: 'all 0.2s',
};

const panelStyle = {
  flex: 1,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const panelTitleStyle = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  color: '#374151',
};

const itemButtonStyle = {
  padding: '12px',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.2s',
  color: '#1f2937',
};

export default Sidebar;