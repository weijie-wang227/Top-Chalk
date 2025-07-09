import React, { useRef, useState, useEffect } from "react";

export default function NotesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffcc");
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) ctxRef.current.strokeStyle = strokeColor;
  }, [strokeColor]);

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBgColor(newColor);

    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = newColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTyping) return;
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { x, y } = getXY(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isTyping) return;
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { x, y } = getXY(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (isTyping) return;
    setIsDrawing(false);
    ctxRef.current?.closePath();
  };

  const getXY = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const placeText = (e: React.MouseEvent) => {
    if (!isTyping) return;
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { x, y } = getXY(e, canvas);
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = strokeColor;
    ctx.fillText(textInput, x, y);
    setTextInput("");
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded"
        onMouseDown={(e) => {
          startDrawing(e);
          placeText(e);
        }}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      <div className="flex flex-wrap items-center gap-4">
        <label>
          Pen Color:{" "}
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
          />
        </label>
        <label>
          Background Color:{" "}
          <input type="color" value={bgColor} onChange={handleBgChange} />
        </label>
        <button
          className="px-4 py-1 bg-red-100 rounded hover:bg-red-200"
          onClick={clearCanvas}
        >
          Clear
        </button>
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={isTyping}
            onChange={(e) => setIsTyping(e.target.checked)}
          />
          Type Mode
        </label>
        {isTyping && (
          <input
            className="border rounded px-2 py-1"
            type="text"
            value={textInput}
            placeholder="Type your note here"
            onChange={(e) => setTextInput(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
