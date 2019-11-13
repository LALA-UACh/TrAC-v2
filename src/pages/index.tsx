import { FaCircle } from "react-icons/fa";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { RequireAuth } from "@componentes";

export default () => {
  return (
    <RequireAuth>
      <Flex
        m={50}
        color="black"
        bg="rgb(245,245,245)"
        w={180}
        h={120}
        borderRadius={5}
        border="2px"
        borderColor="gray.400"
        borderWidth="2px"
      >
        <Flex w="80%" h="100%" pt={2} pl={2} pos="relative">
          <Stack spacing={1}>
            <Text>
              <b>INFO015-08</b>
            </Text>
            <Text fontSize={9}>ECUACIONES DIFERENCIALES PARA INGENIERIA</Text>
          </Stack>
          <Text pos="absolute" bottom={0} left={0} pb={3} pl={2} fontSize="9px">
            <b>SCT: 4</b>
          </Text>
        </Flex>
        <Flex
          w="20%"
          h="100%"
          bg="rgb(117,187,81)"
          direction="column"
          alignItems="center"
          borderRadius="0px 2px 2px 0px"
        >
          <Text mb={2} pt={1}>
            <b>5.8</b>
          </Text>

          <Stack spacing={0.7}>
            {new Array(Math.floor(Math.random() * 3) + 2)
              .fill(0)
              .map((_, k) => (
                <Box
                  key={k}
                  as={FaCircle}
                  m={0}
                  p={0}
                  paddingBottom={1}
                  size="16px"
                  color="rgb(250,50,100)"
                />
              ))}
          </Stack>
        </Flex>
      </Flex>
    </RequireAuth>
  );
};
