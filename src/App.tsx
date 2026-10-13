import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FeeProvider } from "./data/feeStore";
import { ParentProvider } from "./data/parentStore";
import { SessionProvider } from "./session";

export default function App() {
  return (
    <SessionProvider>
      <ParentProvider>
        <FeeProvider>
          <RouterProvider router={router} />
        </FeeProvider>
      </ParentProvider>
    </SessionProvider>
  );
}
