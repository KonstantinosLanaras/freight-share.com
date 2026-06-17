import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface Props {
  userId?: string | null;
  role: "shipper" | "carrier";
  children: ReactNode;
  className?: string;
}

/** Renders the child as a link to /profile/{role}/{userId}, falling back to a span when no user id. */
export function ProfileLink({ userId, role, children, className }: Props) {
  if (!userId) return <span className={className}>{children}</span>;
  return (
    <Link to={`/profile/${role}/${userId}`} className={className ?? "hover:underline"}>
      {children}
    </Link>
  );
}
