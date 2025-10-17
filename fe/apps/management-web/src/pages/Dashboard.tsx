import StatsCard from "@/components/StatsCard";
import { DollarSign, Users, Car, Battery } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const COLORS = ["#065f46", "#0f766e", "#1cbd82ff", "#5ad3b3ff"];

const revenue = [
  { m: "01", v: 210 }, { m: "02", v: 230 }, { m: "03", v: 220 },
  { m: "04", v: 260 }, { m: "05", v: 255 }, { m: "06", v: 290 },
];

const growth = [
  { m: "01", xe: 10, pin: 6 },
  { m: "02", xe: 12, pin: 8 },
  { m: "03", xe: 11, pin: 7 },
  { m: "04", xe: 14, pin: 9 },
  { m: "05", xe: 15, pin: 10 },
  { m: "06", xe: 17, pin: 12 },
];

export default function Dashboard() {
  const stats = [
    { title: "Doanh thu", value: "2,450,000,000đ", delta: "+6%", icon: DollarSign },
    { title: "Bài đăng mới", value: 156, delta: "+5%", icon: Car },
    { title: "Người dùng mới", value: 1_234, delta: "+3%", icon: Users },
    { title: "Tỉ lệ duyệt", value: "94.2%", delta: "+0.4%", icon: Battery },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border rounded-xl bg-white p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Doanh thu theo tháng</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">

          <Card className="border rounded-xl bg-white p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Tăng trưởng theo ngành hàng</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="xe" stackId="a" fill="#0f766e"/>
                  <Bar dataKey="pin" stackId="a" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 border rounded-xl bg-white p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Thao tác nhanh</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Duyệt bài mới", "Quản lý thương hiệu", "Gửi thông báo", "Xuất báo cáo",
              "Quản lý người dùng", "Quản lý giao dịch", "Cài đặt hệ thống", "Tạo tài khoản staff"]
              .map((t) => (
                <div key={t} className="border rounded-lg p-3 hover:bg-emerald-50 cursor-pointer text-sm">
                  {t}
                </div>
              ))}
          </div>
        </Card>

        <Card className="border rounded-xl bg-white p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Hoạt động gần đây</div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 5 bài đăng mới chờ duyệt</li>
            <li>• 2 giao dịch đã hoàn tất</li>
            <li>• 1 tài khoản bị báo cáo</li>
            <li>• 3 pin được cập nhật thông số</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
