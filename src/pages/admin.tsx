import { RequireAuth } from "@components";

export default () => {
  return (
    <RequireAuth admin>
      <div>Admin</div>
    </RequireAuth>
  );
};
