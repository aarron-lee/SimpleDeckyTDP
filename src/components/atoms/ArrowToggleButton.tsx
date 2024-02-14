import { ButtonItem, PanelSectionRow } from "decky-frontend-lib";
import { FC, useEffect, useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

type Props = {
  cacheKey: string;
  defaultOpen?: boolean;
};

const ArrowToggleButton: FC<Props> = ({
  children,
  cacheKey,
  defaultOpen = false,
}) => {
  const [showSliders, setShowSliders] = useState(
    window.localStorage.getItem(cacheKey) === "true" || false
  );

  const toggleState = () => {
    window.localStorage.setItem(cacheKey, `${!showSliders}`);
    setShowSliders(!showSliders);
  };

  useEffect(() => {
    if (defaultOpen && !window.localStorage.getItem(cacheKey)) {
      toggleState();
    }
  }, []);

  return (
    <>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          bottomSeparator={showSliders ? "none" : "thick"}
          style={{
            width: "100%",
            height: "20px",
            display: "flex", // Set the display to flex
            justifyContent: "center", // Center align horizontally
            alignItems: "center", // Center align vertically
          }}
          onClick={toggleState}
        >
          {showSliders ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
        </ButtonItem>
      </PanelSectionRow>
      {showSliders && children}
    </>
  );
};

export default ArrowToggleButton;
