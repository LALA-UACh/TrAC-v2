import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Spinner } from "@chakra-ui/core";

const NotFound: NextPage = () => {
  const { replace } = useRouter();

  useEffect(() => {
    replace("/");
  }, []);

  return <Spinner margin="15px" size="lg" />;
};

export default NotFound;
