import { RequireAuth } from "@componentes";

export default () => {
  return (
    <RequireAuth admin>
      <div>Admin</div>
    </RequireAuth>
  );
};
