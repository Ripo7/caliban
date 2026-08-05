interface TrueScalePayoffProps {
  visible: boolean;
  reducedMotion: boolean;
  onReturn: () => void;
}

export default function TrueScalePayoff({
  visible,
  reducedMotion,
  onReturn,
}: TrueScalePayoffProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center px-6 ${
        reducedMotion ? "" : "transition-opacity duration-1000"
      } ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden={!visible}
    >
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-bone-dim">
          Space is mostly nothing. This is why nobody makes a good asteroid
          visualization.
        </p>
        {visible && (
          <button
            type="button"
            onClick={onReturn}
            className="pointer-events-auto mt-4 font-mono text-xs uppercase tracking-wide text-instrument underline decoration-rule underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-instrument"
          >
            back to readable scale
          </button>
        )}
      </div>
    </div>
  );
}
