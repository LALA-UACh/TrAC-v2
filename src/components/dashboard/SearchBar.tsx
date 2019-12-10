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
} from "@chakra-ui/core";

import dropout from "../../../constants/mockData/dropout";
import { currentUserQuery, myProgramsQuery } from "../../graphql/queries";
import { TrackingContext } from "../Tracking";
import { ConfigContext } from "./Config";
import { DropoutList } from "./DropoutList";

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
  searchResult?: string;
  error?: string;
  mock: boolean;
  setMock: Dispatch<SetStateAction<boolean>>;
}> = ({ isSearchLoading, onSearch, searchResult, error, mock, setMock }) => {
  const { data: currentUserData } = useQuery(currentUserQuery, {
    fetchPolicy: "cache-only",
  });

  const {
    LOGOUT_BUTTON_LABEL,
    SEARCH_BAR_BACKGROUND_COLOR,
    SEARCH_BUTTON_LABEL,
  } = useContext(ConfigContext);

  const Tracking = useContext(TrackingContext);
  const { data: myProgramsData, loading: myProgramsLoading } = useQuery(
    myProgramsQuery,
    {
      ssr: false,
    }
  );

  const [student_id, setStudentId] = useRememberState("student_input", "");
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
            placeholder="..."
            onChange={selected => {
              setProgram(
                selected as $ElementType<typeof programsOptions, number>
              );
            }}
          />
        </Box>
        <Box mr={5} color="white">
          {searchResult}
        </Box>
        <form>
          <Flex wrap="wrap" alignItems="center">
            <Input
              borderColor="gray.400"
              fontFamily="Lato"
              variant="outline"
              width={200}
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
            <datalist id="student_options">
              {studentOptions.map((value, key) => (
                <option key={key} value={value} />
              ))}
            </datalist>
            <Button
              icon
              labelPosition="left"
              primary
              loading={isSearchLoading}
              type="submit"
              disabled={!student_id || isSearchLoading}
              onClick={async ev => {
                ev.preventDefault();
                if (program) {
                  console.log({ program });
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
        <DropoutList
          data={
            mock
              ? range(40).map(() => ({
                  student_id: generate(),
                  probability: dropout.prob_dropout,
                  accuracy: dropout.model_accuracy,
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
