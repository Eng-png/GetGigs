import svgPaths from "./svg-x78afsq3rh";

function ThumbDownOutline() {
  return (
    <div className="relative shrink-0 size-[20.704px]" data-name="thumb-down-outline">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.7037 20.7037">
        <g id="thumb-down-outline">
          <path d={svgPaths.p38dbbf00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ActionBtn() {
  return (
    <div className="aspect-[106/106] h-full relative rounded-[1000px] shrink-0" data-name="ActionBtn">
      <div aria-hidden className="absolute border-[0.796px] border-[rgba(255,255,255,0.16)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[0.796px] py-[8.759px] relative size-full">
          <ThumbDownOutline />
        </div>
      </div>
    </div>
  );
}

function ThumbUpOutline() {
  return (
    <div className="relative shrink-0 size-[20.704px]" data-name="thumb-up-outline">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.7037 20.7037">
        <g id="thumb-up-outline">
          <path d={svgPaths.p289fb980} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ActionBtn1() {
  return (
    <div className="aspect-[106/106] bg-[#dde04a] h-full relative rounded-[1000px] shrink-0" data-name="ActionBtn">
      <div aria-hidden className="absolute border-[0.796px] border-[rgba(255,255,255,0.16)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-center px-[0.796px] py-[8.759px] relative size-full">
          <ThumbUpOutline />
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16.722px] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">2</p>
        </div>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex gap-[12.741px] items-center justify-center relative size-full">
      <ActionBtn />
      <ActionBtn1 />
    </div>
  );
}