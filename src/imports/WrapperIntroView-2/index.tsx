import svgPaths from "./svg-atrnfrqhef";

function Text() {
  return (
    <div className="h-[14px] relative shrink-0 w-[30.055px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[15.5px] not-italic text-[14px] text-black text-center top-[0.5px] tracking-[-0.11px] whitespace-nowrap">Intro</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#dde04a] flex-[334_0_0] h-[47px] min-w-px relative rounded-bl-[10px] rounded-br-[10px]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] relative size-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[14px] relative shrink-0 w-[15.516px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[8.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.11px] whitespace-nowrap">V1</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] flex-[304_0_0] h-[47px] min-w-px opacity-50 relative rounded-bl-[10px] rounded-br-[10px]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] relative size-full">
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[14px] relative shrink-0 w-[18.336px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[9.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.11px] whitespace-nowrap">V2</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] flex-[304_0_0] h-[47px] min-w-px opacity-50 relative rounded-bl-[10px] rounded-br-[10px]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] relative size-full">
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[14px] relative shrink-0 w-[18.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[9.5px] not-italic text-[14px] text-center text-white top-[0.5px] tracking-[-0.11px] whitespace-nowrap">V3</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[rgba(255,255,255,0.2)] flex-[304_0_0] h-[47px] min-w-px opacity-50 relative rounded-bl-[10px] rounded-br-[10px]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] relative size-full">
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d="M2.91797 7H11.0846" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.16667" />
          <path d="M7 2.91667V11.0833" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function ButtonAddVersion() {
  return (
    <div className="h-[47px] relative rounded-bl-[10px] rounded-br-[10px] shrink-0" data-name="Button - Add version">
      <div aria-hidden className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[15px] py-px relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[47px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-end px-[20px] relative size-full">
          <Button />
          <Button1 />
          <Button2 />
          <Button3 />
          <ButtonAddVersion />
        </div>
      </div>
    </div>
  );
}

function LoadInPage() {
  return (
    <div className="[word-break:break-word] absolute content-stretch flex flex-col font-['Google_Sans_Flex:Light',sans-serif] font-light gap-[28px] items-center left-[421px] not-italic text-center top-[102px] w-[528px]" data-name="LoadInPage">
      <p className="leading-[26px] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
        Three recommendation layouts
      </p>
      <p className="leading-[23.8px] min-w-full relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] w-[min-content]" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>{`A remixable template for presenting recommendations three ways: one featured pick, a ranked list, or a single result with comparison. Skinned here as a travel app, but it works for any content you'd compare. Tab through and remix whichever fits.`}</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[5px] items-start leading-[13.876px] not-italic relative size-full text-[9.613px] tracking-[-0.0925px] whitespace-nowrap">
        <p className="relative shrink-0 text-[rgba(255,255,255,0.4)]">Version 1</p>
        <p className="relative shrink-0 text-white">Gallery First</p>
      </div>
    </div>
  );
}

function Container4() {
  return <div className="absolute h-[438.823px] left-0 top-0 w-[201.839px]" data-name="Container" />;
}

function Container6() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[20.05px] not-italic text-[6.025px] text-black text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Explore
        </p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1326)" id="Icon">
          <path d={svgPaths.p1f41f400} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_1326">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[17.573px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[9.51px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Saved
        </p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-[37.154px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container8 />
        <Text4 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1322)" id="Icon">
          <path d={svgPaths.p27569aa0} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.p19a8e100} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_1322">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[14.058px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[8.09px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Trips
        </p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container10 />
        <Text5 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g id="Icon">
          <path d={svgPaths.p3d3e6300} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.p30163980} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[18.577px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[10.52px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Profile
        </p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container12 />
        <Text6 />
      </div>
    </div>
  );
}

function TabBar() {
  return (
    <div className="relative shrink-0 w-full" data-name="TabBar">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[17.071px] relative size-full">
          <Container6 />
          <Container7 />
          <Container9 />
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[#fdfaf6] content-stretch drop-shadow-[0px_0px_7.531px_rgba(0,0,0,0.11)] flex flex-col items-start left-0 py-[8.535px] rounded-tl-[10.042px] rounded-tr-[10.042px] top-[407.77px] w-[201.839px]" data-name="Container">
      <TabBar />
    </div>
  );
}

function ScreenAGallery() {
  return (
    <div className="absolute bg-[#fdfaf6] h-[438.823px] left-0 overflow-clip rounded-[12.552px] top-0 w-[201.839px]" data-name="ScreenAGallery">
      <Container4 />
      <Container5 />
    </div>
  );
}

function ContainerTransform() {
  return (
    <div className="h-[735.029px] relative shrink-0 w-[338.08px]" data-name="Container (transform)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ScreenAGallery />
      </div>
    </div>
  );
}

function MiniPhone() {
  return (
    <div className="h-[438.999px] relative rounded-[12.615px] shrink-0 w-[201.839px]" data-name="MiniPhone">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ContainerTransform />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.092px] items-center relative size-full">
        <Frame />
        <MiniPhone />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[5px] items-start leading-[13.876px] not-italic relative size-full text-[9.613px] tracking-[-0.0925px] whitespace-nowrap">
        <p className="relative shrink-0 text-[rgba(255,255,255,0.4)]">Version 2</p>
        <p className="relative shrink-0 text-white">Scan and Save</p>
      </div>
    </div>
  );
}

function Container16() {
  return <div className="h-[10.042px] relative shrink-0 w-[201.839px]" data-name="Container" />;
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container16 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[32.134px] top-0 w-[201.839px]" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[20.05px] not-italic text-[6.025px] text-black text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Explore
        </p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1326)" id="Icon">
          <path d={svgPaths.p1f41f400} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_1326">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[17.573px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[9.51px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Saved
        </p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 w-[37.154px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container21 />
        <Paragraph />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1322)" id="Icon">
          <path d={svgPaths.p27569aa0} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.p19a8e100} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_1322">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[14.058px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[8.09px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Trips
        </p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container23 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g id="Icon">
          <path d={svgPaths.p345aa80} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.p2d382b80} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[18.577px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[10.52px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Profile
        </p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container25 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[17.071px] relative size-full">
          <Container19 />
          <Container20 />
          <Container22 />
          <Container24 />
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute bg-[#fdfaf6] content-stretch drop-shadow-[0px_0px_7.531px_rgba(0,0,0,0.11)] flex flex-col items-start left-0 py-[8.535px] rounded-tl-[10.042px] rounded-tr-[10.042px] top-[407.77px] w-[201.839px]" data-name="Container">
      <Container18 />
    </div>
  );
}

function ScreenBList() {
  return (
    <div className="absolute bg-[#fdfaf6] h-[438.823px] left-0 overflow-clip rounded-[12.552px] top-0 w-[201.839px]" data-name="ScreenBList">
      <Container14 />
      <Container17 />
    </div>
  );
}

function ContainerTransform1() {
  return (
    <div className="h-[735.029px] relative shrink-0 w-[338.08px]" data-name="Container (transform)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ScreenBList />
      </div>
    </div>
  );
}

function MiniPhone1() {
  return (
    <div className="h-[438.999px] relative rounded-[12.615px] shrink-0 w-[201.839px]" data-name="MiniPhone">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ContainerTransform1 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.092px] items-center relative size-full">
        <Frame1 />
        <MiniPhone1 />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0">
      <div className="[word-break:break-word] bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[5px] items-start leading-[13.876px] not-italic relative size-full text-[9.613px] tracking-[-0.0925px] whitespace-nowrap">
        <p className="relative shrink-0 text-[rgba(255,255,255,0.4)]">Version 3</p>
        <p className="relative shrink-0 text-white">Image Led</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[20.05px] not-italic text-[6.025px] text-black text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Explore
        </p>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1329)" id="Icon">
          <path d={svgPaths.p1d8a0740} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_1329">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[17.573px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[9.51px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Saved
        </p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container30 />
        <Text7 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g clipPath="url(#clip0_1_1318)" id="Icon">
          <path d={svgPaths.p15204880} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.pa677180} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_1318">
            <rect fill="white" height="6.37022" width="6.37022" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[14.058px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[8.09px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Trips
        </p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container32 />
        <Text8 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[0.08px] size-[6.37px] top-[0.08px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.37022 6.37022">
        <g id="Icon">
          <path d={svgPaths.p284cee00} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector" />
          <path d={svgPaths.p1721d870} fill="var(--fill-0, black)" fillOpacity="0.15" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[6.527px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[6.025px] relative shrink-0 w-[18.577px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Google_Sans_Flex:Light',sans-serif] font-light leading-[6.025px] left-[10.52px] not-italic text-[6.025px] text-[rgba(0,0,0,0.15)] text-center top-[0.25px] whitespace-nowrap" style={{ fontVariationSettings: '"GRAD" 0, "ROND" 0, "wdth" 100' }}>
          Profile
        </p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0 w-[37.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.506px] items-center relative size-full">
        <Container34 />
        <Text9 />
      </div>
    </div>
  );
}

function TabBar1() {
  return (
    <div className="relative shrink-0 w-full" data-name="TabBar">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[17.071px] relative size-full">
          <Container28 />
          <Container29 />
          <Container31 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute bg-[#fdfaf6] content-stretch drop-shadow-[0px_0px_7.531px_rgba(0,0,0,0.11)] flex flex-col items-start left-0 py-[8.535px] rounded-tl-[10.042px] rounded-tr-[10.042px] top-[407.77px] w-[201.839px]" data-name="Container">
      <TabBar1 />
    </div>
  );
}

function ScreenCResult() {
  return (
    <div className="absolute bg-[#fdfaf6] h-[438.823px] left-0 overflow-clip rounded-[12.552px] top-0 w-[201.839px]" data-name="ScreenCResult">
      <Container27 />
    </div>
  );
}

function ContainerTransform2() {
  return (
    <div className="h-[735.029px] relative shrink-0 w-[338.08px]" data-name="Container (transform)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <ScreenCResult />
      </div>
    </div>
  );
}

function MiniPhone2() {
  return (
    <div className="h-[438.999px] relative rounded-[12.615px] shrink-0 w-[201.839px]" data-name="MiniPhone">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <ContainerTransform2 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10.092px] items-center relative size-full">
        <Frame2 />
        <MiniPhone2 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex gap-[20.184px] items-center justify-center left-[335.15px] overflow-clip px-[26.912px] top-[304px] w-[699.707px]" data-name="Container">
      <Container3 />
      <Container13 />
      <Container26 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Icon">
          <path d="M25 30L15 20L25 10" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.08333" />
        </g>
      </svg>
    </div>
  );
}

function ButtonPrevious() {
  return (
    <div className="absolute bg-[#dde04a] content-stretch flex items-center justify-center left-[20px] opacity-25 p-px rounded-[11px] size-[88px] top-[842px]" data-name="Button - Previous">
      <div aria-hidden className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[11px]" />
      <Icon10 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Icon">
          <path d="M15 30L25 20L15 10" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.08333" />
        </g>
      </svg>
    </div>
  );
}

function ButtonNext() {
  return (
    <div className="absolute bg-[#dde04a] content-stretch flex items-center justify-center left-[1262px] p-px rounded-[11px] size-[88px] top-[842px]" data-name="Button - Next">
      <div aria-hidden className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[11px]" />
      <Icon11 />
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[950_0_0] min-h-px relative w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <LoadInPage />
        <Container2 />
        <ButtonPrevious />
        <ButtonNext />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="bg-black h-[997px] relative shrink-0 w-[1370px]" data-name="App">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

export default function WrapperIntroView() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Wrapper-Intro_View">
      <App />
    </div>
  );
}