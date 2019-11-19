import { FC } from "react";
import { Icon, Menu, MenuItemProps } from "semantic-ui-react";

export const AdminMenu: FC<{
  active: string;
  setActive: (value: string) => void;
}> = ({ active, setActive }) => {
  const handleClick: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    data: MenuItemProps
  ) => void = (_e, { name }) => {
    if (name) setActive(name);
  };

  return (
    <Menu icon="labeled" pointing secondary>
      <Menu.Item name="users" active={active === "users"} onClick={handleClick}>
        <Icon name="user outline" />
        Usuarios
      </Menu.Item>
      <Menu.Item
        name="programs"
        active={active === "programs"}
        onClick={handleClick}
      >
        <Icon name="table" />
        Programas
      </Menu.Item>
    </Menu>
  );
};
