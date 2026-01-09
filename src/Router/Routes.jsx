import { createBrowserRouter } from "react-router";
import RootLayouts from "../Layouts/RootLayouts";

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayouts,
    }
])

export default router