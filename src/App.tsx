import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ParentProvider } from "./data/parentStore";
import { SessionProvider } from "./session";

export default function App() {
  return (
    <SessionProvider>
      <ParentProvider>
        <RouterProvider router={router} />
      </ParentProvider>
    </SessionProvider>
  );
}
