import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const BlockContext = React.createContext<{
  offset: number;
  fixed: boolean;
} | null>(null);

interface BlockProps extends React.HTMLProps<HTMLDivElement> {
  fixed?: boolean;
}

// ~ =============================================>
// ~ ======= Main layout component  -->
// ~ =============================================>
const Block: React.FC<BlockProps> = ({
  className,
  fixed = false,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    const div = divRef.current;

    if (!div) return;
    const onScroll = () => setOffset(div.scrollTop || 0);

    // ~ ======= cleanup -->
    div.removeEventListener("scroll", onScroll);
    div.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      div.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <BlockContext.Provider value={{ offset, fixed }}>
      <div
        {...props}
        ref={divRef}
        data-layout="layout"
        className={cn(
          "h-full w-full overflow-hidden",
          fixed && "flex flex-col",
          className,
        )}
      />
    </BlockContext.Provider>
  );
};

Block.displayName = "Block";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  sticky?: boolean;
}

// ~ =============================================>
// ~ ======= Header  -->
// ~ =============================================>
const BlockHeader = forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, sticky, ...props }, ref) => {
    // ~ ======= check if layout.header is used within layout component -->
    const contextVal = useContext(BlockContext);
    if (contextVal === null)
      throw new Error(
        `Block.header should be used within ${Block.displayName} component`,
      );

    return (
      <div
        {...props}
        ref={ref}
        data-layout="header"
        className={cn(
          `z-10 flex h-[var(--header-height)] items-center gap-4 border-b bg-background p-4 md:px-8`,
          contextVal.offset > 10 && sticky ? "shadow" : "shadow-none",
          contextVal.fixed && "flex-none",
          sticky && "sticky top-0",
          className,
        )}
      ></div>
    );
  },
);

BlockHeader.displayName = "BlockHeader";

// ~ =============================================>
// ~ ======= Body  -->
// ~ =============================================>
const BlockBody = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  // ~ ======= check if body is used within the layout component -->
  const contextVal = useContext(BlockContext);
  if (contextVal === null)
    throw new Error(
      `Block.Body should be used within ${Block.displayName} component`,
    );

  return (
    <div
      {...props}
      ref={ref}
      data-layout="body"
      className={cn(
        `max-w-8xl mx-auto h-[var(--panel-body-height)] w-full px-4 py-6 md:overflow-x-hidden md:px-10`,
        contextVal?.fixed && "flex-1",
        className,
      )}
    />
  );
});

BlockBody.displayName = "BlockBody";
export default Block;
export { BlockHeader, BlockBody };
