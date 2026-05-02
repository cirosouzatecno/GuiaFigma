import { Outlet } from "react-router";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-expo-gray">
      <Header />
      <main className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
