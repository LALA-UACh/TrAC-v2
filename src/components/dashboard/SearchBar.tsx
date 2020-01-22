import { AnimatePresence, motion } from "framer-motion";
import { range } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { generate } from "randomstring";
import React, {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Select from "react-select";
import { Button, Icon } from "semantic-ui-react";
import pixelWidth from "string-pixel-width";
import { useRememberState } from "use-remember-state";
import { $ElementType } from "utility-types";

import { useQuery } from "@apollo/react-hooks";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Tag,
} from "@chakra-ui/core";

import { MY_PROGRAMS } from "../../graphql/queries";
import { useUser } from "../../utils/useUser";
import { ConfigContext } from "../Config";
import { useTracking } from "../Tracking";

const StudentList = dynamic(() => import("./StudentList"));

const MockingMode: FC<{
  mock: boolean;
  setMock: Dispatch<SetStateAction<boolean>>;
}> = ({ mock, setMock }) => {
  return (
    <Button
      basic
      onClick={() => setMock(mode => !mode)}
      color={mock ? "blue" : "red"}
    >
      {mock ? "Mocking ON" : "Mocking OFF"}
    </Button>
  );
};

export const SearchBar: FC<{
  isSearchLoading: boolean;
  onSearch: (input: {
    student_id: string;
    program_id: string;
  }) => Promise<"student" | "program" | undefined>;
  searchResult?: {
    curriculums: string[];
    student?: string;
    program_id?: string;
  };
  error?: string;
  mock: boolean;
  setMock: Dispatch<SetStateAction<boolean>>;
  curriculum: string | undefined;
  setCurriculum: Dispatch<SetStateAction<string | undefined>>;
  setProgram: Dispatch<SetStateAction<string | undefined>>;
}> = ({
  isSearchLoading,
  onSearch,
  searchResult,
  error,
  mock,
  setMock,
  curriculum,
  setCurriculum,
  setProgram: setProgramProp,
}) => {
  useEffect(() => {
    if (
      (curriculum === undefined &&
        (searchResult?.curriculums.length ?? 0) > 0) ||
      !searchResult?.curriculums.includes(curriculum ?? "")
    ) {
      setCurriculum(
        searchResult?.curriculums
          .sort()
          .slice()
          .reverse()[0]
      );
    }
  }, [curriculum, setCurriculum, searchResult?.curriculums]);

  const { user } = useUser();

  const {
    LOGOUT_BUTTON_LABEL,
    SEARCH_BAR_BACKGROUND_COLOR,
    SEARCH_BUTTON_LABEL,
    NO_CURRICULUMS_LABEL,
    PROGRAM_NOT_SPECIFIED_PLACEHOLDER,
    CURRICULUM_LABEL,
    STUDENT_LABEL,
    PLACEHOLDER_SEARCH_STUDENT,
  } = useContext(ConfigContext);

  const [, { setTrackingData, track }] = useTracking();
  const { data: myProgramsData, loading: myProgramsLoading } = useQuery(
    MY_PROGRAMS,
    {
      ssr: false,
    }
  );

  const [student_id, setStudentId] = useRememberState<string>(
    "student_input",
    ""
  );

  const [studentOptions, setStudentOptions] = useRememberState<string[]>(
    "student_input_options",
    []
  );
  const addStudentOption = useCallback(
    (value: string) => {
      if (value && !studentOptions.includes(value)) {
        setStudentOptions([...studentOptions, value]);
      }
    },
    [studentOptions, setStudentOptions]
  );

  useEffect(() => {
    if (student_id.trim() !== student_id) {
      setStudentId(student => student.trim());
    }
  }, [student_id, setStudentId]);

  const [logoutLoading, setLogoutLoading] = useState(false);

  const [studentIdShow, setStudentIdShow] = useState("");

  const programsOptions = useMemo(() => {
    return (
      myProgramsData?.myPrograms.map(({ id, name }) => ({
        label: `${id} - ${name}`,
        value: id,
      })) ?? []
    );
  }, [myProgramsLoading, myProgramsData]);

  const [program, setProgram] = useRememberState<
    $ElementType<typeof programsOptions, number> | undefined
  >("program_input", undefined);

  const { push } = useRouter();

  useEffect(() => {
    if (
      myProgramsData?.myPrograms &&
      programsOptions.findIndex(programFound => {
        return programFound.value === program?.value;
      }) === -1
    ) {
      setProgram(programsOptions[0]);
    }
  }, [program, setProgram, programsOptions, setProgramProp, myProgramsData]);

  useEffect(() => {
    setTrackingData({
      program_menu: program?.value,
    });
  }, [program, setTrackingData]);

  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      alignContent="flex-end"
      backgroundColor={SEARCH_BAR_BACKGROUND_COLOR}
      p={3}
      cursor="default"
      wrap="wrap"
    >
      <Flex wrap="wrap" alignItems="center">
        <Box width={300} mr={4} fontSize="0.85em">
          <Select<{ value: string; label: string }>
            options={programsOptions}
            value={program || null}
            isLoading={isSearchLoading}
            isDisabled={isSearchLoading}
            placeholder={PROGRAM_NOT_SPECIFIED_PLACEHOLDER}
            onChange={(selected: any) => {
              track({
                action: "click",
                effect: `change-program-menu-to-${selected?.value}`,
                target: "program-menu",
              });
              setProgram(
                selected as $ElementType<typeof programsOptions, number>
              );
            }}
          />
        </Box>
        {(searchResult?.curriculums.length ?? 0) > 1 ? (
          <Flex mr={5}>
            <Tag variantColor="blue" variant="outline">
              {searchResult?.program_id} | {CURRICULUM_LABEL}
            </Tag>
            <Box width={90} ml={2}>
              <Select
                options={
                  searchResult?.curriculums
                    .sort()
                    .slice()
                    .reverse()
                    .map(curriculum => {
                      return {
                        label: curriculum,
                        value: curriculum,
                      };
                    }) ?? []
                }
                value={
                  curriculum
                    ? { value: curriculum, label: curriculum }
                    : undefined
                }
                onChange={selected => {
                  track({
                    action: "click",
                    target: "curriculum-menu",
                    effect: "change-curriculum",
                  });
                  setCurriculum(
                    (selected as { label: string; value: string }).value
                  );
                }}
                placeholder="..."
                noOptionsMessage={() => NO_CURRICULUMS_LABEL}
              />
            </Box>
          </Flex>
        ) : searchResult?.curriculums.length === 1 ? (
          <Tag
            mr={2}
            mt={1}
            mb={1}
            p={2}
          >{`${searchResult?.program_id} | ${CURRICULUM_LABEL}: ${searchResult?.curriculums[0]}`}</Tag>
        ) : null}
        {searchResult?.student && (
          <Tag
            cursor="text"
            mt={1}
            mb={1}
            mr={2}
            p={3}
            maxW="300px"
            textAlign="center"
          >{`${STUDENT_LABEL}: ${studentIdShow}`}</Tag>
        )}

        <form>
          <Flex wrap="wrap" alignItems="center">
            <InputGroup size="lg" mt={2} mb={2}>
              <Input
                borderColor="gray.400"
                fontFamily="Lato"
                variant="outline"
                fontSize="1em"
                width={Math.min(
                  // Width should maximum 300 for mobile
                  Math.max(
                    // Width has to be at least 160 for the placeholder text
                    pixelWidth(student_id ?? "", { size: 21 }),
                    160
                  ),
                  300
                )}
                list="student_options"
                placeholder={PLACEHOLDER_SEARCH_STUDENT}
                value={student_id}
                onChange={({
                  target: { value },
                }: ChangeEvent<HTMLInputElement>) => {
                  setStudentId(value);
                }}
                mr={4}
                isDisabled={isSearchLoading}
              />
              {studentOptions.findIndex(value => {
                return student_id === value;
              }) === -1 && (
                <datalist id="student_options">
                  {studentOptions.map((value, key) => (
                    <option key={key} value={value} />
                  ))}
                </datalist>
              )}

              {student_id !== "" && (
                <InputRightElement
                  mr={1}
                  cursor="pointer"
                  onClick={() => {
                    setStudentId("");
                  }}
                >
                  <Icon color="grey" name="close" />
                </InputRightElement>
              )}
            </InputGroup>

            <Button
              icon
              labelPosition="left"
              primary
              loading={isSearchLoading}
              type="submit"
              disabled={isSearchLoading || !program?.value}
              onClick={async ev => {
                setProgramProp(program?.value);
                if (program) {
                  ev.preventDefault();
                  const onSearchResult = await onSearch({
                    student_id,
                    program_id: program.value,
                  });

                  switch (onSearchResult) {
                    case "student": {
                      addStudentOption(student_id);
                      setStudentIdShow(student_id);
                      setStudentId("");
                      track({
                        action: "click",
                        effect: "load-student",
                        target: "search-button",
                      });
                      break;
                    }
                    case "program": {
                      setTrackingData({
                        student: undefined,
                      });

                      setStudentIdShow("");
                      track({
                        action: "click",
                        effect: "load-program",
                        target: "search-button",
                      });
                      break;
                    }
                    default: {
                      setTrackingData({
                        student: student_id,
                      });
                      setStudentIdShow("");
                      track({
                        action: "click",
                        effect: "wrong-student",
                        target: "search-button",
                      });
                    }
                  }
                }
              }}
              size="medium"
            >
              <Icon name="search" />
              {SEARCH_BUTTON_LABEL}
            </Button>
            <AnimatePresence>
              {!isSearchLoading && error && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert
                    key="error"
                    status="error"
                    borderRadius={4}
                    whiteSpace="pre-wrap"
                    mt={5}
                    mb={5}
                    maxWidth="40vw"
                  >
                    <AlertIcon />
                    <AlertTitle mr={2}>{error}</AlertTitle>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
        </form>
      </Flex>

      <Flex wrap="wrap" justifyContent="flex-end" className="stack">
        {user?.admin && <MockingMode mock={mock} setMock={setMock} />}
        {user?.config?.SHOW_STUDENT_LIST && (
          <StudentList
            program_id={program?.value}
            mockData={
              mock
                ? range(70).map(() => ({
                    student_id: "mock_" + generate(),
                    dropout_probability: Math.round(Math.random() * 100),
                    start_year: 2005 + Math.round(Math.random() * 14),
                    progress: Math.round(Math.random() * 100),
                  }))
                : undefined
            }
            searchStudent={async (student_id: string) => {
              if (program) {
                setStudentId(student_id);
                const onSearchResult = await onSearch({
                  student_id,
                  program_id: program?.value,
                });
                switch (onSearchResult) {
                  case "student": {
                    addStudentOption(student_id);
                    setStudentId("");
                    setStudentIdShow(student_id);
                    track({
                      action: "click",
                      effect: "load-student",
                      target: "student-list-row",
                    });
                    break;
                  }
                  case "program": {
                    setStudentIdShow("");
                    setTrackingData({
                      student: undefined,
                    });
                    track({
                      action: "click",
                      effect: "load-program",
                      target: "student-list-row",
                    });
                    break;
                  }
                  default: {
                    setStudentIdShow("");
                    setTrackingData({
                      student: student_id,
                    });
                    track({
                      action: "click",
                      effect: "wrong-student",
                      target: "student-list-row",
                    });
                  }
                }
              }
            }}
          />
        )}

        <Button
          negative
          size="large"
          disabled={logoutLoading}
          loading={logoutLoading}
          onClick={async () => {
            setLogoutLoading(true);

            track({
              action: "click",
              effect: "logout",
              target: "logoutButton",
            });
            setTimeout(() => {
              push("/logout");
            }, 1000);
          }}
          icon
          labelPosition="left"
        >
          <Icon name="power off" />
          {LOGOUT_BUTTON_LABEL}
        </Button>
      </Flex>
    </Flex>
  );
};

export default SearchBar;
