import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
// 💡 방금 만든 Sidebar 컴포넌트를 가져옵니다.
import Sidebar from './Sidebar';

const Canvas = () => {
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  // --- 💡 텍스트 레이어들을 관리할 배열 상태 추가 ---
  const [texts, setTexts] = useState([]);
  const [selectedElement, setSelectedElement] = useState({ id: null, type: null });

  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // 현재 선택된 오브젝트 객체 반환 구조 확장
  const getSelectedObject = () => {
    if (selectedElement.type === 'rect') return rectangles.find(r => r.id === selectedElement.id);
    if (selectedElement.type === 'circle') return circles.find(c => c.id === selectedElement.id);
    if (selectedElement.type === 'text') return texts.find(t => t.id === selectedElement.id);
    return null;
  };
  const currentSelectedObj = getSelectedObject();

  // [기능] 레이어 추가 함수들
  const addRectangle = () => {
    const newRect = {
      id: `rect_${Date.now()}`, x: 150, y: 150, width: 100, height: 100, fill: '#3b82f6', opacity: 1,
    };
    setRectangles([...rectangles, newRect]);
  };

  const addCircle = () => {
    const newCircle = {
      id: `circle_${Date.now()}`, x: 300, y: 200, radius: 50, fill: '#ef4444', opacity: 1,
    };
    setCircles([...circles, newCircle]);
  };

  // --- 💡 [기능] 텍스트 추가 함수 ---
  const addText = (defaultText, size, isBold) => {
    const newText = {
      id: `text_${Date.now()}`,
      x: 200,
      y: 250,
      text: defaultText,
      fontSize: size,
      fontStyle: isBold ? 'bold' : 'normal',
      fill: '#1f2937',
      opacity: 1,
    };
    setTexts([...texts, newText]);
  };

  // 속성 제어 함수들 (색상, 투명도)
  const changeColor = (newColor) => {
    if (selectedElement.type === 'rect') setRectangles(rectangles.map(r => r.id === selectedElement.id ? { ...r, fill: newColor } : r));
    if (selectedElement.type === 'circle') setCircles(circles.map(c => c.id === selectedElement.id ? { ...c, fill: newColor } : c));
    if (selectedElement.type === 'text') setTexts(texts.map(t => t.id === selectedElement.id ? { ...t, fill: newColor } : t));
  };

  const changeOpacity = (newOpacity) => {
    const opacityVal = parseFloat(newOpacity);
    if (selectedElement.type === 'rect') setRectangles(rectangles.map(r => r.id === selectedElement.id ? { ...r, opacity: opacityVal } : r));
    if (selectedElement.type === 'circle') setCircles(circles.map(c => c.id === selectedElement.id ? { ...c, opacity: opacityVal } : c));
    if (selectedElement.type === 'text') setTexts(texts.map(t => t.id === selectedElement.id ? { ...t, opacity: opacityVal } : t));
  };

  // 레이어 삭제 함수
  const deleteSelected = () => {
    if (!selectedElement.id) return;
    if (selectedElement.type === 'rect') setRectangles(rectangles.filter(r => r.id !== selectedElement.id));
    if (selectedElement.type === 'circle') setCircles(circles.filter(c => c.id !== selectedElement.id));
    if (selectedElement.type === 'text') setTexts(texts.filter(t => t.id !== selectedElement.id));
    setSelectedElement({ id: null, type: null });
    transformerRef.current.nodes([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, rectangles, circles, texts]);

  const handleDownload = () => {
    transformerRef.current.nodes([]);
    const dataUrl = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'miricanvas-export.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElement({ id: null, type: null });
      transformerRef.current.nodes([]);
    }
  };

  const handleSelect = (e, id, type) => {
    setSelectedElement({ id, type });
    transformerRef.current.nodes([e.target]);
  };

  // 드래그 및 크기 조절 데이터 업데이트 구조 (텍스트 스케일 예외처리 추가)
  const handleTransformOrDragEnd = (id, type, targetNode) => {
    if (type === 'rect') {
      setRectangles(rectangles.map(r => r.id === id ? {
        ...r, x: targetNode.x(), y: targetNode.y(),
        width: Math.max(10, targetNode.width() * targetNode.scaleX()),
        height: Math.max(10, targetNode.height() * targetNode.scaleY())
      } : r));
    } else if (type === 'circle') {
      setCircles(circles.map(c => c.id === id ? {
        ...c, x: targetNode.x(), y: targetNode.y(),
        radius: Math.max(5, c.radius * targetNode.scaleX())
      } : c));
    } else if (type === 'text') {
      // 💡 텍스트는 테두리를 늘릴 때 글자 크기(fontSize) 자체가 커지도록 배율 계산을 적용합니다.
      setTexts(texts.map(t => t.id === id ? {
        ...t, x: targetNode.x(), y: targetNode.y(),
        fontSize: Math.max(8, targetNode.fontSize() * targetNode.scaleX())
      } : t));
    }
    targetNode.scaleX(1); targetNode.scaleY(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* TOP TOOLBAR */}
      <div style={{ height: '60px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 'bold', color: '#1f2937' }}>MiriCanvas Studio</span>
          {currentSelectedObj ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#4b5563' }}>색상:</label>
                <input type="color" value={currentSelectedObj.fill} onChange={(e) => changeColor(e.target.value)} style={{ cursor: 'pointer', width: '35px', height: '28px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#4b5563' }}>투명도:</label>
                <input type="range" min="0" max="1" step="0.1" value={currentSelectedObj.opacity ?? 1} onChange={(e) => changeOpacity(e.target.value)} style={{ cursor: 'pointer' }} />
              </div>
              <button onClick={deleteSelected} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>선택 삭제</button>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>도형이나 텍스트를 선택하면 편집 메뉴가 활성화됩니다.</span>
          )}
        </div>
        <button onClick={handleDownload} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📥 이미지 다운로드</button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* 💡 개별 파일로 분리한 Sidebar를 장착하고 함수들을 패스해 줍니다 */}
        <Sidebar addRectangle={addRectangle} addCircle={addCircle} addText={addText} />

        {/* CANVAS WORKSPACE */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
          <Stage
            width={800} height={600}
            ref={stageRef}
            style={{ backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              {rectangles.map((rect) => (
                <Rect key={rect.id} id={rect.id} {...rect} draggable onClick={(e) => handleSelect(e, rect.id, 'rect')} onDragEnd={(e) => handleTransformOrDragEnd(rect.id, 'rect', e.target)} onTransformEnd={(e) => handleTransformOrDragEnd(rect.id, 'rect', e.target)} />
              ))}
              {circles.map((circle) => (
                <Circle key={circle.id} id={circle.id} {...circle} draggable onClick={(e) => handleSelect(e, circle.id, 'circle')} onDragEnd={(e) => handleTransformOrDragEnd(circle.id, 'circle', e.target)} onTransformEnd={(e) => handleTransformOrDragEnd(circle.id, 'circle', e.target)} />
              ))}
              {/* 💡 텍스트 레이어 순회 렌더링 추가 */}
              {texts.map((t) => (
                <Text key={t.id} id={t.id} {...t} draggable onClick={(e) => handleSelect(e, t.id, 'text')} onDragEnd={(e) => handleTransformOrDragEnd(t.id, 'text', e.target)} onTransformEnd={(e) => handleTransformOrDragEnd(t.id, 'text', e.target)} />
              ))}
              <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 15 || newBox.height < 15) ? oldBox : newBox} />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default Canvas;