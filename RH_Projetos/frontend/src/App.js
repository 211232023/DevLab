import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";

const App = () => {
    return (
        <div className="App">
            <div className="app-content">
                <AppRoutes />
            </div>
            <Footer />
        </div>
    );
};

export default App;