import {
  fromPairs,
  isEqual,
  sortBy,
  toNumber,
  toPairs,
  toString,
} from "lodash";
import React, {
  FC,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useDebounce } from "react-use";
import {
  Button,
  Checkbox,
  Icon,
  Input,
  Label,
  TextArea,
} from "semantic-ui-react";
import { isJSON } from "validator";

import { useMutation } from "@apollo/react-hooks";
import { Box, Flex, Stack } from "@chakra-ui/core";

import { baseConfigAdmin } from "../../../constants/baseConfig";
import { configValueToString } from "../../../constants/validation";
import { ConfigContext } from "../../context/Config";
import { EDIT_CONFIG } from "../../graphql/adminQueries";
import { CONFIG_QUERY } from "../../graphql/queries";
import { Confirm } from "../Confirm";

const baseConfigKeys = Object.keys(baseConfigAdmin);

const ConfigInput: FC<{ configKey: string; configValue: any }> = memo(
  ({ configKey, configValue }) => {
    const [state, setState] = useState(configValue);
    const [editConfig, { error, loading }] = useMutation(EDIT_CONFIG, {
      update: (cache, { data }) => {
        if (data?.editConfig) {
          cache.writeQuery({
            query: CONFIG_QUERY,
            data: {
              config: data.editConfig,
            },
          });
        }
      },
    });
    useEffect(() => {
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        toast(error.message, {
          type: "error",
        });
      }
    }, [error]);
    return (
      <Flex alignItems="center" m={1} wrap="wrap" alignContent="space-between">
        <Label size="large" style={{ wordBreak: " break-all" }}>
          {configKey}
        </Label>

        {(() => {
          switch (typeof baseConfigAdmin[configKey]) {
            case "boolean":
              return (
                <Checkbox
                  checked={state}
                  onChange={() => {
                    setState(!state);
                  }}
                  type="checkbox"
                />
              );
            case "string":
              return state.length > 22 ? (
                <TextArea
                  value={state}
                  placeholder={baseConfigAdmin[configKey]}
                  onChange={(_, { value }) => {
                    setState(toString(value));
                  }}
                  rows={4}
                  style={{ width: 300 }}
                />
              ) : (
                <Input
                  value={state}
                  placeholder={baseConfigAdmin[configKey]}
                  onChange={(_, { value }) => {
                    setState(toString(value));
                  }}
                />
              );
            case "number":
              return (
                <Input
                  value={state}
                  onChange={(_, { value }) => {
                    setState(toNumber(value) || 0);
                  }}
                />
              );
            case "object":
              return (
                <TextArea
                  value={JSON.stringify(state, null, 2)}
                  placeholder={baseConfigAdmin[configKey]}
                  onChange={(_, { value }) => {
                    value = toString(value);
                    if (isJSON(value)) {
                      setState(JSON.parse(value));
                    }
                  }}
                  rows={6}
                  style={{ width: 300 }}
                />
              );
            default:
              return null;
          }
        })()}
        {!isEqual(state, configValue) && (
          <Confirm
            content={`Are you sure you want to modify "${configKey}" from "${configValueToString(
              configValue
            )}" to "${configValueToString(state)}"?`}
          >
            <Button
              disabled={loading}
              loading={loading}
              icon
              labelPosition="left"
              style={{ wordBreak: "break-all", marginLeft: "5px" }}
              primary
              onClick={() => {
                editConfig({
                  variables: {
                    name: configKey,
                    value: configValueToString(state),
                  },
                });
              }}
              size="tiny"
            >
              <Icon name="save" />
              Save changes of {configKey}
            </Button>
          </Confirm>
        )}
      </Flex>
    );
  }
);

export const AdminConfig = () => {
  const config: typeof baseConfigAdmin = useContext(ConfigContext);

  const [filterInput, setFilterInput] = useState("");
  const [filteredKeys, setFilteredKeys] = useState(baseConfigKeys);
  const [] = useDebounce(
    () => {
      setFilteredKeys(
        baseConfigKeys.filter(keyName => {
          if (filterInput) {
            return keyName.includes(filterInput);
          }
          return true;
        })
      );
    },
    500,
    [filterInput]
  );
  const configList = useMemo(() => {
    return sortBy(filteredKeys).map(configKey => {
      return (
        <ConfigInput
          key={configKey}
          configKey={configKey}
          configValue={config[configKey]}
        />
      );
    });
  }, [filteredKeys, config]);

  useEffect(() => {
    console.log(
      "export const baseConfig = " +
        JSON.stringify(fromPairs(sortBy(toPairs(config), 0)), null, 2) +
        ";"
    );
  }, [config]);

  return (
    <Stack
      alignItems="flex-start"
      spacing={1}
      className="96"
      width="fit-content"
      m={5}
    >
      <Box border="2px solid black" p={4}>
        <Input
          label="Filter config keys"
          value={filterInput}
          onChange={(_, { value }) => {
            setFilterInput(value.toUpperCase());
          }}
          placeholder="No filter"
        />
      </Box>

      {configList}
    </Stack>
  );
};
