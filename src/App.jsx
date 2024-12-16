import React, { useEffect, useState } from "react";

function App() {
  const [boxes, setBoxes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    addBox(null);
  }, []);

  const addBox = (parentIndex) => {
    const boxWidth = 128; // 32 * 4 (Tailwind width class w-32)
    const boxHeight = 128; // 32 * 4 (Tailwind height class h-32)
    let randomTop, randomLeft, overlap;

    do {
      randomTop = Math.floor(Math.random() * (window.innerHeight - boxHeight));
      randomLeft = Math.floor(Math.random() * (window.innerWidth - boxWidth));
      overlap = boxes.some(
        (box) =>
          randomTop < box.top + boxHeight &&
          randomTop + boxHeight > box.top &&
          randomLeft < box.left + boxWidth &&
          randomLeft + boxWidth > box.left
      );
    } while (overlap);

    setBoxes([...boxes, { top: randomTop, left: randomLeft, parentIndex }]);
  };

  const handleMouseDown = (index, e) => {
    setIsDragging(true);
    setDraggingIndex(index);
    setOffset({
      x: e.clientX - boxes[index].left,
      y: e.clientY - boxes[index].top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggingIndex !== null) {
      const newLeft = e.clientX - offset.x;
      const newTop = e.clientY - offset.y;
      const updatedBoxes = [...boxes];
      updatedBoxes[draggingIndex] = {
        ...updatedBoxes[draggingIndex],
        left: Math.max(0, Math.min(newLeft, window.innerWidth - 128)),
        top: Math.max(0, Math.min(newTop, window.innerHeight - 128)),
      };
      setBoxes(updatedBoxes);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingIndex(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset, draggingIndex]);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <svg className="absolute w-full h-full">
        {boxes.map((box, index) => {
          if (box.parentIndex !== null) {
            const parentBox = boxes[box.parentIndex];
            return (
              <line
                key={index}
                x1={parentBox.left + 64} // Center of parent box
                y1={parentBox.top + 64} // Center of parent box
                x2={box.left + 64} // Center of current box
                y2={box.top + 64} // Center of current box
                stroke="black"
                strokeDasharray="4"
              />
            );
          }
          return null;
        })}
      </svg>
      {boxes.map((box, index) => (
        <div
          key={index}
          className="absolute w-32 h-32 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg rounded-lg flex items-center justify-center"
          style={{ top: `${box.top}px`, left: `${box.left}px` }}
          onMouseDown={(e) => handleMouseDown(index, e)}
        >
          <span className="text-white font-bold text-2xl">{index}</span>
          <button
            className="bg-white text-black w-8 h-8 flex items-center justify-center absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full shadow-md hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              addBox(index);
            }}
          >
            +
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
