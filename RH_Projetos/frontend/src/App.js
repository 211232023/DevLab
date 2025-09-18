import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";

const App = () => {
    return (
        <>
            <div className="app-content">
                <AppRoutes />
            </div>
            <Footer />
        </>
    );
};

export default App;