import { AnimatePresence, motion } from "framer-motion";
import { range } from "lodash";
import Link from "next/link";
import { generate } from "randomstring";
import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

import { CURRENT_USER, MY_PROGRAMS } from "../../graphql/queries";
import { TrackingContext } from "../Tracking";
import { ConfigContext } from "./Config";
import { StudentList } from "./StudentList";

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
  }) => Promise<boolean>;
  searchResult?: { curriculums: string[]; student?: string };
  error?: string;
  mock: boolean;
  setMock: Dispatch<SetStateAction<boolean>>;
  curriculum: string | undefined;
  setCurriculum: Dispatch<SetStateAction<string | undefined>>;
}> = ({
  isSearchLoading,
  onSearch,
  searchResult,
  error,
  mock,
  setMock,
  curriculum,
  setCurriculum,
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

  const { data: currentUserData } = useQuery(CURRENT_USER, {
    fetchPolicy: "cache-only",
  });

  const {
    LOGOUT_BUTTON_LABEL,
    SEARCH_BAR_BACKGROUND_COLOR,
    SEARCH_BUTTON_LABEL,
  } = useContext(ConfigContext);

  const Tracking = useContext(TrackingContext);
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

  useEffect(() => {
    if (program === undefined && programsOptions[0]) {
      setProgram(programsOptions[0]);
    }
  }, [program, setProgram, programsOptions]);

  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor={SEARCH_BAR_BACKGROUND_COLOR}
      p={3}
      cursor="default"
      wrap="wrap"
    >
      <Flex alignItems="center" wrap="wrap">
        <Box width={350} mr={4}>
          <Select
            options={programsOptions}
            value={program}
            isLoading={isSearchLoading}
            isDisabled={isSearchLoading}
            placeholder="Programa no especificado"
            onChange={selected => {
              setProgram(
                selected as $ElementType<typeof programsOptions, number>
              );
            }}
          />
        </Box>
        {(searchResult?.curriculums.length ?? 0) > 1 ? (
          <Flex mr={5}>
            <Tag variantColor="blue" variant="outline">
              Plan
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
                  setCurriculum(
                    (selected as { label: string; value: string }).value
                  );
                }}
                placeholder="..."
                noOptionsMessage={() => "Sin planes"}
              />
            </Box>
          </Flex>
        ) : searchResult?.curriculums.length === 1 ? (
          <Tag mr={2}>{`Plan: ${searchResult?.curriculums[0]}`}</Tag>
        ) : null}
        {searchResult?.student && (
          <Tag mr={2}>{`Estudiante ${searchResult.student}`}</Tag>
        )}

        <form>
          <Flex wrap="wrap" alignItems="center">
            <InputGroup size="lg">
              <Input
                borderColor="gray.400"
                fontFamily="Lato"
                variant="outline"
                width={Math.min(
                  Math.max(pixelWidth(student_id ?? "", { size: 21 }), 180),
                  350
                )}
                list="student_options"
                placeholder="ID del estudiante"
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
                if (program) {
                  ev.preventDefault();
                  const ok = await onSearch({
                    student_id,
                    program_id: program.value,
                  });
                  if (ok) {
                    addStudentOption(student_id);
                    setStudentId("");

                    Tracking.current.track({
                      action: "click",
                      effect: "load-student",
                      target: "searchButton",
                    });
                  } else {
                    Tracking.current.track({
                      action: "click",
                      effect: "wrong-student",
                      target: "searchButton",
                    });
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

      <Box>
        {currentUserData?.currentUser?.user?.admin && (
          <MockingMode mock={mock} setMock={setMock} />
        )}
        <StudentList
          data={
            mock
              ? range(40).map(() => ({
                  student_id: generate(),
                  dropout_probability: Math.round(Math.random() * 100),
                  start_year: 2005 + Math.round(Math.random() * 14),
                  progress: Math.round(Math.random() * 100),
                }))
              : []
          }
        />
        <Link href="/logout">
          <Button
            negative
            size="big"
            onClick={() => {
              Tracking.current.track({
                action: "click",
                effect: "logout",
                target: "logoutButton",
              });
            }}
          >
            {LOGOUT_BUTTON_LABEL}
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};
