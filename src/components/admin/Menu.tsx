import React, { Dispatch, FC, SetStateAction } from "react";
import { Icon, Menu, MenuItemProps } from "semantic-ui-react";

import { IS_NOT_PRODUCTION } from "../../../constants";
import { AdminMenuTypes } from "../../../pages/admin";

export const AdminMenu: FC<{
  active: AdminMenuTypes;
  setActive: Dispatch<SetStateAction<AdminMenuTypes>>;
}> = ({ active, setActive }) => {
  const handleClick: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    data: MenuItemProps
  ) => void = (_e, { name }) => {
    switch (name) {
      case AdminMenuTypes.baseConfig:
      case AdminMenuTypes.users:
      case AdminMenuTypes.data:
      case AdminMenuTypes.feedback:
      case AdminMenuTypes.programs: {
        setActive(name);
        return;
      }
      default: {
        if (IS_NOT_PRODUCTION) {
          throw new Error("Invalid name!");
        }
      }
    }
  };

  return (
    <Menu icon="labeled" pointing secondary>
      <Menu.Item
        name={AdminMenuTypes.users}
        active={active === AdminMenuTypes.users}
        onClick={handleClick}
      >
        <Icon name="user outline" />
        Users
      </Menu.Item>
      <Menu.Item
        name={AdminMenuTypes.programs}
        active={active === AdminMenuTypes.programs}
        onClick={handleClick}
      >
        <Icon name="table" />
        Programs
      </Menu.Item>
      <Menu.Item
        name={AdminMenuTypes.baseConfig}
        active={active === AdminMenuTypes.baseConfig}
        onClick={handleClick}
      >
        <Icon name="settings" />
        Base Config
      </Menu.Item>
      <Menu.Item
        name={AdminMenuTypes.data}
        active={active === AdminMenuTypes.data}
        onClick={handleClick}
      >
        <Icon name="database" />
        Data
      </Menu.Item>
      <Menu.Item
        name={AdminMenuTypes.feedback}
        active={active === AdminMenuTypes.feedback}
        onClick={handleClick}
      >
        <Icon name="comments outline" />
        Feedback
      </Menu.Item>
    </Menu>
  );
};
