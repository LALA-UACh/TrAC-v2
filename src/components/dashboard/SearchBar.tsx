import Link from "next/link";
import {
  ChangeEvent,
  FC,
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
import { TrackingContext } from "@components/Tracking";
import { myProgramsQuery } from "@graphql/queries";

export const SearchBar: FC<{
  isSearchLoading: boolean;
  onSearch: (input: {
    student_id: string;
    program_id: number;
  }) => Promise<boolean>;
  searchResult?: string;
  error?: string;
}> = ({ isSearchLoading, onSearch, searchResult, error }) => {
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
      backgroundColor="rgb(52,58,64)"
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
              disabled={!student_id}
              onClick={async ev => {
                ev.preventDefault();
                if (program) {
                  const ok = await onSearch({
                    student_id,
                    program_id: program.value,
                  });
                  if (ok) {
                    addStudentOption(student_id);
                    setStudentId("");
                  }
                  Tracking.current.track({
                    action: "click",
                    effect: "load-student",
                    target: "searchButton",
                  });
                }
              }}
              size="medium"
            >
              <Icon name="search" />
              Buscar
            </Button>
            {!isSearchLoading && error && (
              <Alert
                status="error"
                borderRadius={4}
                whiteSpace="pre-wrap"
                mt={5}
                mb={5}
              >
                <AlertIcon />
                <AlertTitle mr={2}>{error}</AlertTitle>
              </Alert>
            )}
          </Flex>
        </form>
      </Flex>
      <Box>
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
            Salir
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};
