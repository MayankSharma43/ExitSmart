import React from "react";

declare module "@/components/react-bits/CountUp.jsx" {
  export interface CountUpProps {
    to?: number;
    from?: number;
    direction?: "up" | "down";
    delay?: number;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
    startWhen?: boolean;
    separator?: string;
    prefix?: string;
    suffix?: string;
    mode?: "count" | "roll";
    easing?: string;
    decimals?: number;
    format?: string;
    trigger?: "view" | "load";
    replayOnHover?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  }
  const CountUp: React.FC<CountUpProps>;
  export default CountUp;
}

declare module "@/components/react-bits/DepthCarousel.jsx" {
  export interface DepthCarouselProps {
    items?: Array<{ image: string; alt?: string }>;
    cardWidth?: number;
    cardHeight?: number;
    radius?: number;
    tint?: string;
    depth?: number;
    spread?: number;
    tilt?: number;
    tiltDirection?: "left" | "right";
    perspective?: number;
    visibleCards?: number;
    falloff?: number;
    blur?: number;
    duration?: number;
    ease?: string;
    autoplay?: boolean;
    autoplayDelay?: number;
    loop?: boolean;
    showControls?: boolean;
    showIndicators?: boolean;
    onChange?: (index: number) => void;
    className?: string;
  }
  const DepthCarousel: React.FC<DepthCarouselProps>;
  export default DepthCarousel;
}

declare module "@/components/react-bits/GlowCursor.jsx" {
  export interface GlowCursorProps {
    color?: string;
    secondaryColor?: string;
    intensity?: number;
    trailWidth?: number;
    linger?: number;
    glow?: number;
    hotspot?: number;
    followSpeed?: number;
    grain?: number;
    clickBurst?: boolean;
    quality?: string;
    theme?: string;
    blendMode?: string;
    maxDevicePixelRatio?: number;
    enabled?: boolean;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }
  const GlowCursor: React.FC<GlowCursorProps>;
  export default GlowCursor;
}

declare module "@/components/react-bits/MaskedHeading.jsx" {
  export interface MaskedHeadingProps {
    text?: string;
    tag?: string;
    mediaType?: string;
    src?: string;
    poster?: string;
    fillScale?: number;
    parallax?: number;
    drift?: number;
    hoverZoom?: number;
    brightness?: number;
    saturation?: number;
    grayscale?: boolean;
    tint?: string;
    spotlight?: boolean;
    spotlightRadius?: number;
    outline?: boolean;
    outlineColor?: string;
    outlineWidth?: number;
    reveal?: string;
    duration?: number;
    stagger?: number;
    trigger?: string;
    align?: string;
    weight?: number;
    tracking?: number;
    lineHeight?: number;
    textScale?: number;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  const MaskedHeading: React.FC<MaskedHeadingProps>;
  export default MaskedHeading;
}

declare module "@/components/react-bits/PillNav.jsx" {
  export interface PillNavItem {
    label: string;
    href?: string;
    onClick?: () => void;
  }
  export interface PillNavProps {
    items?: PillNavItem[];
    theme?: string;
    layout?: string;
    itemStyle?: string;
    hoverEffect?: string;
    indicator?: string;
    surface?: string;
    size?: string;
    collapse?: string;
    intro?: boolean;
    ariaLabel?: string;
    className?: string;
    [key: string]: any;
  }
  const PillNav: React.FC<PillNavProps>;
  export default PillNav;
}

declare module "@/components/react-bits/SpecularButton.jsx" {
  export interface SpecularButtonProps {
    type?: "button" | "submit" | "reset";
    size?: string;
    radius?: number;
    tint?: string;
    tintOpacity?: number;
    textColor?: string;
    lineColor?: string;
    baseColor?: string;
    intensity?: number;
    idleIntensity?: number;
    glow?: number;
    followMouse?: boolean;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    [key: string]: any;
  }
  const SpecularButton: React.FC<SpecularButtonProps>;
  export default SpecularButton;
}

declare module "@/components/react-bits/SplitFlapText.jsx" {
  export interface SplitFlapTextProps {
    words?: string[];
    text?: string;
    flipDuration?: number;
    stagger?: number;
    cycleDelay?: number;
    charset?: string;
    flipsPerChar?: number;
    tileColor?: string;
    textColor?: string;
    tileRadius?: number;
    gap?: number;
    fontSize?: number;
    loop?: boolean;
    padTo?: number;
    align?: string;
    intro?: boolean;
    glare?: number;
    depth?: number;
    tileStyle?: string;
    [key: string]: any;
  }
  const SplitFlapText: React.FC<SplitFlapTextProps>;
  export default SplitFlapText;
}

// Relative path declarations
declare module "./react-bits/CountUp.jsx" {
  const CountUp: any;
  export default CountUp;
}
declare module "./react-bits/DepthCarousel.jsx" {
  const DepthCarousel: any;
  export default DepthCarousel;
}
declare module "./react-bits/GlowCursor.jsx" {
  const GlowCursor: any;
  export default GlowCursor;
}
declare module "./react-bits/MaskedHeading.jsx" {
  const MaskedHeading: any;
  export default MaskedHeading;
}
declare module "./react-bits/PillNav.jsx" {
  const PillNav: any;
  export default PillNav;
}
declare module "./react-bits/SpecularButton.jsx" {
  const SpecularButton: any;
  export default SpecularButton;
}
declare module "./react-bits/SplitFlapText.jsx" {
  const SplitFlapText: any;
  export default SplitFlapText;
}
