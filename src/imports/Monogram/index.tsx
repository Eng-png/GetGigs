import svgPaths from "./svg-5lv41bs5eu";

function Group() {
  return (
    <div className="relative size-full">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.912 11.1363">
        <g id="Group 2147257843">
          <path d={svgPaths.p1ac2f840} fill="var(--fill-0, black)" fillOpacity="0.5" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Monogram() {
  return (
    <div className="border-[1.198px] border-[rgba(0,0,0,0.5)] border-solid overflow-clip relative rounded-[17.969px] size-full" data-name="Monogram">
      <div className="absolute flex inset-[calc(31.62%-0.44px)_calc(24.11%-0.62px)_calc(31.63%-0.44px)_calc(24.1%-0.62px)] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
          <Group />
        </div>
      </div>
    </div>
  );
}