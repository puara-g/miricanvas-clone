import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Transformer } from 'react-konva';

const Canvas = () => {
  // 1. 캔버스 위에 올라간 모든 도형(오브젝트)들을 관리하는 배열 상태
  // 미리캔버스의 '레이어 리스트' 데이터 구조와 동일합니다.
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);

  // 2. 현재 사용자가 마우스로 클릭해 선택한 오브젝트의 ID와 타입 관리
  const [selectedElement, setSelectedElement] = useState({ id: null, type: null });

  // 3. 크기 조절 프레임(Transformer) 제어를 위한 Ref
  const transformerRef = useRef(null);

  // 4. [기능] 새로운 사각형 추가 함수
  const addRectangle = () => {
    const newRect = {
      // 고유 ID를 생성하여 리액트 key값 및 선택 상태 추적에 활용합니다.
      id: `rect_${Date.now()}`,
      // 캔버스 중앙 근처에 자연스럽게 배치되도록 기본 좌표 설정
      x: 150 + (rectangles.length * 10), 
      y: 150 + (rectangles.length * 10),
      width: 100,
      height: 100,
      fill: '#3b82f6', // Tailwind의 blue-500
    };
    setRectangles([...rectangles, newRect]);
  };

  // 5. [기능] 새로운 원 추가 함수
  const addCircle = () => {
    const newCircle = {
      id: `circle_${Date.now()}`,
      x: 300 + (circles.length * 10),
      y: 200 + (circles.length * 10),
      radius: 50, // 원은 width/height 대신 반지름(radius)을 사용합니다.
      fill: '#ef4444', // Tailwind의 red-500
    };
    setCircles([...circles, newCircle]);
  };

  // 6. [UX] 캔버스 빈 도화지 영역 클릭 시 선택 해제 처리
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement({ id: null, type: null });
      transformerRef.current.nodes([]); // Transformer 타겟 초기화
    }
  };

  // 7. [UX] 특정 도형을 클릭했을 때 선택 및 Transformer 연결 함수
  const handleSelect = (e, id, type) => {
    setSelectedElement({ id, type });
    const node = e.target;
    transformerRef.current.nodes([node]); // 클릭된 노드에 크기 조절러 부착
    transformerRef.current.getLayer().batchDraw(); // 캔버스 즉시 재실행
  };

  // 8. [데이터 갱신] 드래그나 크기 조절이 끝났을 때 최신 좌표/크기를 배열 상태에 저장
  const handleTransformOrDragEnd = (id, type, targetNode) => {
    if (type === 'rect') {
      const updatedRects = rectangles.map((rect) => {
        if (rect.id === id) {
          const scaleX = targetNode.scaleX();
          const scaleY = targetNode.scaleY();
          // 스케일 변화율을 실제 크기에 반영한 후 스케일 속성은 1로 초기화합니다.
          targetNode.scaleX(1);
          targetNode.scaleY(1);

          return {
            ...rect,
            x: targetNode.x(),
            y: targetNode.y(),
            width: Math.max(10, targetNode.width() * scaleX),
            height: Math.max(10, targetNode.height() * scaleY),
          };
        }
        return rect;
      });
      setRectangles(updatedRects);
    } else if (type === 'circle') {
      const updatedCircles = circles.map((circle) => {
        if (circle.id === id) {
          const scaleX = targetNode.scaleX();
          targetNode.scaleX(1);
          targetNode.scaleY(1);

          return {
            ...circle,
            x: targetNode.x(),
            y: targetNode.y(),
            // 원은 가로 스케일 비율을 반지름에 곱해 크기를 변경합니다.
            radius: Math.max(5, circle.radius * scaleX),
          };
        }
        return circle;
      });
      setCircles(updatedCircles);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* SIDEBAR: 미리캔버스의 왼쪽 리소스 메뉴 영역 */}
      <div style={{
        width: '240px',
        backgroundColor: '#ffffff',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'col',
        gap: '12px',
        zIndex: 10
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>컴포넌트 추가</h3>
        <button onClick={addRectangle} style={buttonStyle}>■ 사각형 추가</button>
        <button onClick={addCircle} style={buttonStyle}>● 원 추가</button>
      </div>

      {/* CANVAS AREA: 중앙 편집 공간 */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Stage
          width={700}
          height={600}
          style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {/* 1. 생성된 모든 사각형들 렌더링 */}
            {rectangles.map((rect) => (
              <Rect
                key={rect.id}
                {...rect}
                draggable
                onClick={(e) => handleSelect(e, rect.id, 'rect')}
                onDragEnd={(e) => handleTransformOrDragEnd(rect.id, 'rect', e.target)}
                onTransformEnd={(e) => handleTransformOrDragEnd(rect.id, 'rect', e.target)}
              />
            ))}

            {/* 2. 생성된 모든 원들 렌더링 */}
            {circles.map((circle) => (
              <Circle
                key={circle.id}
                {...circle}
                draggable
                onClick={(e) => handleSelect(e, circle.id, 'circle')}
                onDragEnd={(e) => handleTransformOrDragEnd(circle.id, 'circle', e.target)}
                onTransformEnd={(e) => handleTransformOrDragEnd(circle.id, 'circle', e.target)}
              />
            ))}

            {/* 3. 선택된 오브젝트에 크기 조절 가이드를 띄워주는 공용 Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 도형이 너무 작아져서 완전히 사라지는 버그 방지 예외처리
                if (newBox.width < 15 || newBox.height < 15) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

    </div>
  );
};

// 버튼 기본 스타일링
const buttonStyle = {
  padding: '12px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  textAlign: 'left',
};

export default Canvas;