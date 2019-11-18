import { cloneElement, useState } from "react";
import { Confirm } from "semantic-ui-react";

export default ({
  children,
  content,
  confirmButton,
  cancelButton,
  header,
  size = "small",
}: {
  children: JSX.Element;
  content?: string;
  confirmButton?: string;
  cancelButton?: string;
  header?: string;
  size?: "mini" | "tiny" | "small" | "large" | "fullscreen";
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Confirm
        open={open}
        onConfirm={() => {
          if (children.props.onClick) children.props.onClick();
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        content={content}
        confirmButton={confirmButton}
        cancelButton={cancelButton}
        header={header}
        size={size}
      />
      {cloneElement(children, {
        onClick: () => {
          setOpen(true);
        },
      })}
    </>
  );
};
