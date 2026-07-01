import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer } from 'react-konva';

const Canvas = () => {
  // 1. 상태 관리 (도형 데이터 배열)
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedElement, setSelectedElement] = useState({ id: null, type: null });

  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // 2. 현재 선택된 오브젝트 찾아오기
  const getSelectedObject = () => {
    if (selectedElement.type === 'rect') return rectangles.find(r => r.id === selectedElement.id);
    if (selectedElement.type === 'circle') return circles.find(c => c.id === selectedElement.id);
    return null;
  };
  const currentSelectedObj = getSelectedObject();

  // 3. [기능] 사각형/원 동적 추가
  const addRectangle = () => {
    const newRect = {
      id: `rect_${Date.now()}`,
      x: 150 + (rectangles.length * 15), y: 150 + (rectangles.length * 15),
      width: 100, height: 100, fill: '#3b82f6', opacity: 1,
    };
    setRectangles([...rectangles, newRect]);
  };

  const addCircle = () => {
    const newCircle = {
      id: `circle_${Date.now()}`,
      x: 300 + (circles.length * 15), y: 200 + (circles.length * 15),
      radius: 50, fill: '#ef4444', opacity: 1,
    };
    setCircles([...circles, newCircle]);
  };

  // 4. [기능] 속성 변경 (색상, 투명도)
  const changeColor = (newColor) => {
    if (selectedElement.type === 'rect') {
      setRectangles(rectangles.map(r => r.id === selectedElement.id ? { ...r, fill: newColor } : r));
    } else if (selectedElement.type === 'circle') {
      setCircles(circles.map(c => c.id === selectedElement.id ? { ...c, fill: newColor } : c));
    }
  };

  const changeOpacity = (newOpacity) => {
    if (selectedElement.type === 'rect') {
      setRectangles(rectangles.map(r => r.id === selectedElement.id ? { ...r, opacity: parseFloat(newOpacity) } : r));
    } else if (selectedElement.type === 'circle') {
      setCircles(circles.map(c => c.id === selectedElement.id ? { ...c, opacity: parseFloat(newOpacity) } : c));
    }
  };

  // 5. [기능] 선택된 도형 삭제 (버튼 및 키보드 Delete용)
  const deleteSelected = () => {
    if (!selectedElement.id) return;
    if (selectedElement.type === 'rect') {
      setRectangles(rectangles.filter(r => r.id !== selectedElement.id));
    } else if (selectedElement.type === 'circle') {
      setCircles(circles.filter(c => c.id !== selectedElement.id));
    }
    // 삭제 후 선택 해제
    setSelectedElement({ id: null, type: null });
    transformerRef.current.nodes([]);
  };

  // 키보드 Delete 키 이벤트 감지 리스너
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, rectangles, circles]);

  // 6. [기능] JPG/PNG 이미지로 다운로드 (미리캔버스 필수 기능)
  const handleDownload = () => {
    // 다운로드할 때는 순간적으로 크기조절 핸들러(Transformer)를 숨겨서 깔끔하게 출력합니다.
    transformerRef.current.nodes([]);
    const dataUrl = stageRef.current.toDataURL();
    
    const link = document.createElement('a');
    link.download = 'miricanvas-export.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 다운로드 완료 후 다시 핸들러 복구
    if (currentSelectedObj) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedElement.id}`);
      if (selectedNode) transformerRef.current.nodes([selectedNode]);
    }
  };

  // 7. 캔버스 선택 핸들러
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
              {/* 색상 피커 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#4b5563' }}>색상:</label>
                <input type="color" value={currentSelectedObj.fill} onChange={(e) => changeColor(e.target.value)} style={{ cursor: 'pointer', width: '35px', height: '28px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              {/* 투명도 슬라이더 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#4b5563' }}>투명도:</label>
                <input type="range" min="0" max="1" step="0.1" value={currentSelectedObj.opacity ?? 1} onChange={(e) => changeOpacity(e.target.value)} style={{ cursor: 'pointer' }} />
              </div>
              {/* 삭제 버튼 */}
              <button onClick={deleteSelected} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>선택 삭제</button>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>도형을 선택하면 편집 메뉴가 활성화됩니다.</span>
          )}
        </div>
        {/* 다운로드 버튼 */}
        <button onClick={handleDownload} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📥 이미지 다운로드</button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR */}
        <div style={{ width: '240px', backgroundColor: '#ffffff', padding: '20px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 'bold', color: '#374151' }}>레이어 추가</h3>
          <button onClick={addRectangle} style={sidebarBtnStyle}>■ 사각형 레이어 추가</button>
          <button onClick={addCircle} style={sidebarBtnStyle}>● 원 레이어 추가</button>
        </div>

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
              <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 15 || newBox.height < 15) ? oldBox : newBox} />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

const sidebarBtnStyle = {
  padding: '12px', backgroundColor: '#f3f4f6', color: '#1f2937',
  border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 'bold', textAlign: 'left', transition: 'all 0.2s'
};

export default Canvas;