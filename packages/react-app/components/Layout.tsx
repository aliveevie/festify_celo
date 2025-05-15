import { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
    children: ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
    return (
        <>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8fafc] via-[#e6f4f1] to-[#f0fdf4]">
                <Header />
                <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-10">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Layout;
