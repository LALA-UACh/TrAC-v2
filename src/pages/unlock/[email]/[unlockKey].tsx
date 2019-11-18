import { useRouter } from "next/router";

export default () => {
  const {
    query: { email, unlockKey }
  } = useRouter();
  if (typeof email !== "string" || typeof unlockKey !== "string") {
    throw new Error("Unexpected query!");
  }
  return (
    <div>
      {email}|{unlockKey}
    </div>
  );
};
