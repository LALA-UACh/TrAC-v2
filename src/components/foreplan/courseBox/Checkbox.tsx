import classNames from "classnames";
import { motion } from "framer-motion";
import Markdown from "markdown-to-jsx";
import React, { FC, memo, useContext, useMemo, useState } from "react";
import { Checkbox } from "semantic-ui-react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

import { ICourse } from "../../../../interfaces";
import { ConfigContext } from "../../../context/Config";
import {
  useForeplanIsDirectTake,
  useIsForeplanCourseChecked,
} from "../../../context/ForeplanContext";
import { useTracking } from "../../../context/Tracking";
import styles from "./foreplanCourseBox.module.css";

const useWarningModel = ({
  code,
  name,
  isPossible,
}: Pick<ICourse, "code" | "name"> & { isPossible: boolean }) => {
  const config = useContext(ConfigContext);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  const { CodeLabel, NameLabel } = useMemo(() => {
    const CodeLabel: FC = () => {
      return (
        <Text as="span">
          <b>{code}</b>
        </Text>
      );
    };

    const NameLabel: FC = () => {
      return (
        <Text as="span">
          <b>{name}</b>
        </Text>
      );
    };

    return { CodeLabel, NameLabel };
  }, [code, name]);

  const modalComponent = useMemo(() => {
    if (!isPossible) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setManuallyClosed(true);
          onClose();
        }}
        size="xl"
        preserveScrollBarGap
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Alert
              status="warning"
              flexDirection="column"
              justifyContent="center"
              textAlign="center"
            >
              <AlertIcon
                size={config.FOREPLAN_WARNING_INDIRECT_TAKE_ICON_SIZE}
              />
              <AlertTitle
                fontSize={config.FOREPLAN_WARNING_INDIRECT_TAKE_TITLE_FONT_SIZE}
              >
                {config.FOREPLAN_WARNING_INDIRECT_TAKE_TITLE}
              </AlertTitle>
              <br />
              <AlertDescription
                maxWidth="sm"
                fontSize={config.FOREPLAN_WARNING_INDIRECT_TAKE_BODY_FONT_SIZE}
              >
                <Markdown
                  options={{
                    overrides: {
                      Code: CodeLabel,
                      Name: NameLabel,
                    },
                  }}
                >
                  {config.FOREPLAN_WARNING_INDIRECT_TAKE_BODY}
                </Markdown>
              </AlertDescription>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button
              variantColor="blue"
              mr={3}
              cursor="pointer"
              onClick={() => {
                setManuallyClosed(true);
                onClose();
              }}
            >
              {config.FOREPLAN_WARNING_INDIRECT_TAKE_CLOSE_BUTTON_LABEL}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }, [
    isOpen,
    onOpen,
    onClose,
    isPossible,
    setManuallyClosed,
    CodeLabel,
    NameLabel,
  ]);

  return {
    isOpen,
    modalComponent,
    onOpen,
    onClose,
    manuallyClosed,
  };
};

const ForeplanCourseCheckbox: FC<Pick<
  ICourse,
  "code" | "credits" | "name"
>> = memo(({ code, credits, name }) => {
  const [
    checked,
    { addCourseForeplan, removeCourseForeplan, setFutureCourseRequisitesState },
  ] = useIsForeplanCourseChecked({ code });
  const [directTake] = useForeplanIsDirectTake({ code });
  const { onOpen, manuallyClosed, modalComponent } = useWarningModel({
    code,
    name,
    isPossible: !directTake,
  });
  const [, { track }] = useTracking();

  return (
    <>
      <motion.div
        key="foreplanCourseCheckbox"
        initial={{
          opacity: 0,
        }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
        }}
        className={styles.courseCheckbox}
      >
        <Checkbox
          checked={checked}
          onChange={ev => {
            ev.preventDefault();
            ev.stopPropagation();
            if (checked) {
              setFutureCourseRequisitesState(code, false);
              removeCourseForeplan(code);
              track({
                action: "click",
                effect: "remove_course_foreplan",
                target: `foreplan_${code}_course_checkbox`,
              });
            } else {
              if (!directTake && !manuallyClosed) {
                onOpen();
              }
              setFutureCourseRequisitesState(code, true);
              addCourseForeplan(code, {
                credits: credits?.[0]?.value ?? 0,
                name,
              });
              track({
                action: "click",
                effect: "add_course_foreplan",
                target: `foreplan_${code}_course_checkbox`,
              });
            }
          }}
          className={classNames({
            [styles.checkboxInput]: true,
            [directTake ? styles.direct : styles.indirect]: true,
            foreplanCourseCheckboxIndirect: !directTake,
          })}
        />
      </motion.div>
      {modalComponent}
    </>
  );
});

export default ForeplanCourseCheckbox;
