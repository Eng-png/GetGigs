import svgPaths from "./svg-0y6c61n8nl";
import imgFrame2147262169 from "./984d6d456b80b8fa049ed717be77fad01ff8008f.png";
import imgFrame2147262167 from "./cac075dca4a2c1c9cfa0ff0297ab3a015f06f4fc.png";
import imgFrame2147262168 from "./e62260264384061deae8c88a16642102b4f8a070.png";
import imgFrame2147260823 from "./6f8f5b336c814c18a20c4e8afb4e8a34d0c9578b.png";
import imgFrame2147260824 from "./27e109c2d3a011f3ed5bb2a8bb32924cb2fce06e.png";

function Frame6() {
  return (
    <div className="h-[299.507px] relative rounded-[20.901px] shadow-[0px_-1.306px_3.919px_0px_rgba(0,0,0,0.1)] w-[337.103px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20.901px] size-full" src={imgFrame2147262169} />
    </div>
  );
}

function Frame5() {
  return (
    <div className="h-[299.507px] relative rounded-[20.901px] shadow-[0px_-1.306px_3.919px_0px_rgba(0,0,0,0.1)] w-[346.257px]">
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[20.901px]">
        <img alt="" className="absolute max-w-none object-cover rounded-[20.901px] size-full" src={imgFrame2147262167} />
        <img alt="" className="absolute max-w-none object-cover rounded-[20.901px] size-full" src={imgFrame2147262168} />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#ddd864] content-stretch flex items-center justify-center px-[8px] py-[6px] relative rounded-[74.26px] shrink-0">
      <p className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] [word-break:break-word] font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[1.2] not-italic relative shrink-0 text-[12px] text-black whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100, "GRAD" 0, "ROND" 0' }}>
        Featured
      </p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#ddd864] content-stretch flex items-center justify-center px-[8px] py-[6px] relative rounded-[74.26px] shrink-0">
      <p className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] [word-break:break-word] font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[1.2] not-italic relative shrink-0 text-[12px] text-black whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100, "GRAD" 0, "ROND" 0' }}>
        91% Match
      </p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-[206.256px]">
      <Frame1 />
      <Frame4 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[4.865px] items-center relative shrink-0 w-[39.189px]">
      <div className="relative shrink-0 size-[8.702px]">
        <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.27612 7.87106">
            <path d={svgPaths.p157b4000} fill="var(--fill-0, white)" id="Star 1" />
          </svg>
        </div>
      </div>
      <p className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] [word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">4.91</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="backdrop-blur-[6.081px] content-stretch flex items-center justify-between relative shrink-0 w-[321.7px]">
      <Frame7 />
      <Frame3 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex h-[313.51px] items-start left-0 overflow-clip p-[15.597px] rounded-[20.901px] shadow-[0px_-2.613px_5.225px_0px_rgba(0,0,0,0.25)] top-0 w-[352.894px]">
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[20.901px]">
        <div className="absolute bg-[#d9d9d9] inset-0 rounded-[20.901px]" />
        <div className="absolute inset-0 overflow-hidden rounded-[20.901px]">
          <img alt="" className="absolute h-[142.73%] left-0 max-w-none top-[-32.48%] w-full" src={imgFrame2147260823} />
        </div>
        <img alt="" className="absolute max-w-none object-cover rounded-[20.901px] size-full" src={imgFrame2147260824} />
        <div className="absolute bg-gradient-to-b from-[13.942%] from-[rgba(0,0,0,0.4)] inset-0 rounded-[20.901px] to-[rgba(0,0,0,0.4)] via-[58.074%] via-[rgba(51,51,51,0)]" />
      </div>
      <Frame2 />
    </div>
  );
}

export default function CardStack() {
  return (
    <div className="contents relative size-full" data-name="Card Stack">
      <div className="absolute flex h-[320.612px] items-center justify-center left-0 top-0 w-[355.706px]">
        <div className="flex-none rotate-[-3.7deg]">
          <Frame6 />
        </div>
      </div>
      <div className="absolute flex h-[314.521px] items-center justify-center left-0 top-0 w-[359.159px]">
        <div className="flex-none rotate-[2.53deg]">
          <Frame5 />
        </div>
      </div>
      <Frame />
    </div>
  );
}