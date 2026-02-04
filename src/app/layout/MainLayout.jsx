import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../Components/Other/Sidebar/Sidebar";
import AdminHeader from "../../Components/Other/Header/AdminHeader";

export default function MainLayout() {
    const [active, setActive] = useState(false); 
    return (
        <div className="flex w-full overflow-hidden relative">
            <Sidebar open={active} onClose={() => setActive(false)} />
            <div
                className={`mt-[80px] pb-[30px] px-[15px] min-h-screen transition-all duration-300`}
                style={{
                    marginLeft: !active ? "265px" : "110px",
                    width: !active ? "calc(100% - 265px)" : "100%",
                }}
            >
                <AdminHeader active={() => setActive(!active)} sidebarOpen={!active} />
                <Outlet />
            </div>
        </div>
    );
}