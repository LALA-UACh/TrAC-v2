import { toSafeInteger, toString } from "lodash";
import React, { FC, memo, useState } from "react";
import { useSetState } from "react-use";
import { Checkbox, Input, Label, TextArea } from "semantic-ui-react";
import { isJSON } from "validator";

import { Box, Flex, Stack } from "@chakra-ui/core";

import { baseConfigAdmin as baseConfig } from "../../../constants/baseConfig";

type BaseConfig = typeof baseConfig;

const baseConfigKeys = Object.keys(baseConfig);

const ConfigInput: FC<{ configKey: string; configValue: any }> = memo(
  ({ configKey, configValue }) => {
    const [state, setState] = useState(configValue);

    return (
      <Box m={1}>
        {(() => {
          switch (typeof baseConfig[configKey]) {
            case "boolean":
              return (
                <Checkbox
                  checked={state}
                  label={configKey}
                  onChange={() => {
                    setState(!state);
                  }}
                  type="checkbox"
                />
              );
            case "string":
              return (
                <Input
                  value={state}
                  label={configKey}
                  placeholder={baseConfig[configKey]}
                  onChange={(_, { value }) => {
                    setState(toString(value));
                  }}
                />
              );
            case "number":
              return (
                <Input
                  value={state}
                  label={configKey}
                  onChange={(_, { value }) => {
                    setState(toSafeInteger(value));
                  }}
                />
              );
            case "object":
              return (
                <Flex alignItems="center">
                  <Label>{configKey}</Label>

                  <TextArea
                    value={JSON.stringify(state)}
                    placeholder={baseConfig[configKey]}
                    onChange={(_, { value }) => {
                      value = toString(value);
                      setState(
                        isJSON(toString(value))
                          ? JSON.parse(value)
                          : baseConfig[configKey]
                      );
                    }}
                    rows={6}
                    style={{ width: 300 }}
                  />
                </Flex>
              );
            default:
              return null;
          }
        })()}
      </Box>
    );
  }
);

export const AdminConfig = () => {
  const [config] = useSetState<BaseConfig>({
    ...baseConfig,
  });

  return (
    <Stack alignItems="flex-start" spacing={1}>
      {baseConfigKeys.map(configKey => {
        return (
          <ConfigInput
            key={configKey}
            configKey={configKey}
            configValue={config[configKey]}
          />
        );
      })}
    </Stack>
  );
};
