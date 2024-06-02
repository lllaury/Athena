// pages/index.js
import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import Header from "../components/Header";

const Home = () => {
    return (
        <div className="container mx-auto">
            <Header />
            <KanbanBoard />
        </div>
    );
};

export default Home;
