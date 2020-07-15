import { addDays, startOfDay, subDays } from "date-fns";
import { format, utcToZonedTime } from "date-fns-tz";
import { saveAs } from "file-saver";
import { Parser } from "json2csv";
import { uniqBy } from "lodash";
import { reverse } from "lodash/fp";
import React, { FC, useMemo } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Button, Icon } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Box, Divider, Heading, Spinner, Stack, Text } from "@chakra-ui/core";
import { css } from "@emotion/core";

import { TrackInfoQueryResult, useTrackInfoQuery } from "../../../graphql";
import { trimEveryLine } from "../../../utils";
import { usePagination } from "../Pagination";

const textAlignCenter = css`
  text-align: center;
`;

const TrackerParser = new Parser<
  NonNullable<TrackInfoQueryResult["data"]>["trackInfo"][number]
>({
  fields: [
    {
      label: "User",
      value: "user_id",
    },
    {
      label: "Datetime",
      value: "datetime",
    },
    {
      label: "Data",
      value: "data",
    },
    {
      label: "App",
      value: "app_id",
    },
  ],
});

const minDateDefault = startOfDay(subDays(new Date(), 7)).toISOString();
const maxDateDefault = startOfDay(addDays(new Date(), 1)).toISOString();

export const AdminTrack: FC = () => {
  const [minDate, setMinDate] = useRememberState(
    "trac-track-minDate",
    minDateDefault
  );
  const [maxDate, setMaxDate] = useRememberState(
    "trac-track-maxDate",
    maxDateDefault
  );

  const startDate = new Date(minDate);
  const endDate = new Date(maxDate);

  const [usersFilter, setUsersFilter] = useRememberState<string[]>(
    "trac-track-info-users-filter",
    []
  );

  const [descending, setDescending] = useRememberState(
    "trac-track-info-descending",
    true
  );

  const { data, loading } = useTrackInfoQuery({
    variables: {
      minDate,
      maxDate,
    },
    fetchPolicy: "cache-and-network",
  });

  const onlyUsers = useMemo(() => {
    return uniqBy(data?.trackInfo, (v) => {
      return v.user_id;
    }).map(({ user_id }) => user_id);
  }, [data]);

  const filteredData = useMemo(() => {
    let trackInfo = data?.trackInfo || [];
    if (!descending) {
      trackInfo = reverse(trackInfo);
    }

    if (usersFilter.length) {
      return trackInfo.filter((row) => {
        return usersFilter.includes(row.user_id);
      });
    }
    return trackInfo;
  }, [descending, usersFilter, data]);

  const { pagination, selectedData } = usePagination({
    name: "admin-tracking-pagination",
    data: filteredData,
  });

  return (
    <Stack alignItems="center">
      <Heading color="black">Minimum Date</Heading>
      <DatePicker
        selected={startDate}
        inline
        onChange={(date) => {
          if (date) {
            setMinDate(date.toISOString());
          }
        }}
        css={textAlignCenter}
        showTimeSelect
        dateFormat="MM/dd/yyyy h:mm aa"
        selectsStart
        startDate={startDate}
        endDate={endDate}
      />
      <Heading color="black">Maximum Date</Heading>
      <DatePicker
        inline
        selected={endDate}
        onChange={(date) => {
          if (date) {
            setMaxDate(date.toISOString());
          }
        }}
        css={textAlignCenter}
        showTimeSelect
        dateFormat="MM/dd/yyyy h:mm aa"
        selectsEnd
        minDate={startDate}
        startDate={startDate}
        endDate={endDate}
      />
      <br />
      <Button
        primary
        onClick={() => {
          setMinDate(minDateDefault);
          setMaxDate(maxDateDefault);
        }}
      >
        Reset to last week
      </Button>

      <Divider />

      <Heading>Filter by users</Heading>
      <Box width={300}>
        <Select
          isMulti
          options={onlyUsers.map((value) => ({ value, label: value }))}
          onChange={(selected: any) => {
            if (selected) {
              setUsersFilter(
                selected.map(
                  ({ value }: { value: string; label: string }) => value
                )
              );
            } else {
              setUsersFilter([]);
            }
          }}
          classNamePrefix="react-select"
          placeholder="Filter by users"
          value={usersFilter.map((value) => ({ value, label: value }))}
        />
      </Box>

      <Divider />

      <Button
        disabled={filteredData.length === 0}
        icon
        labelPosition="left"
        color="green"
        css={css`
          margin-bottom: 1em !important;
        `}
        onClick={() => {
          const dataStr = TrackerParser.parse(filteredData);

          saveAs(
            new Blob(
              [
                "\uFEFF" +
                  (usersFilter.length
                    ? `Filtering users: ${usersFilter.join(";")}\n\n`
                    : "") +
                  dataStr,
              ],
              {
                type: "text/csv;charset=UTF-8",
              }
            ),
            `TrAC - Tracking Info - from ${format(
              utcToZonedTime(startDate, "America/Santiago"),
              "PPPPpppp"
            )} to ${format(
              utcToZonedTime(endDate, "America/Santiago"),
              "PPPPpppp"
            )}.csv`
          );
        }}
      >
        <Icon name="download" />
        Download Data (CSV)
      </Button>

      {pagination}

      <Button
        icon
        labelPosition="left"
        color="orange"
        onClick={() => {
          setDescending((desc) => !desc);
        }}
        css={css`
          margin-top: 1em !important;
        `}
      >
        <Icon name={descending ? "arrow down" : "arrow up"} />
        {descending ? "Newest first" : "Oldest first"}
      </Button>

      {loading ? (
        <Spinner color="black" marginTop="1em" size="xl" />
      ) : (
        <Text color="black" paddingTop="1em">
          <b>N° items:</b> {filteredData.length}
        </Text>
      )}

      {selectedData.map(({ id, data, app_id, datetime, user_id }) => {
        return (
          <Text
            key={id}
            width="fit-content"
            margin="1em"
            border="1px solid black"
            borderRadius="5px"
            paddingTop="1em"
            paddingBottom="1em"
            paddingLeft="5em"
            paddingRight="5em"
            textAlign="center"
            whiteSpace="pre-wrap"
            wordBreak="break-all"
            color="black"
          >
            <span>
              <b>user: </b>
              {user_id}
            </span>
            <br />
            <span>
              <b>{"datetime: "}</b>
              {format(utcToZonedTime(datetime, "America/Santiago"), "PPPPpppp")}
            </span>
            <br />
            <span>
              <b>app: </b>
              {app_id}
            </span>
            <br />
            <span>
              <b>data: </b>
              {"\n" + trimEveryLine(data.split(",").join("\n"))}
            </span>
          </Text>
        );
      })}
    </Stack>
  );
};
