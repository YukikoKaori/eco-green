import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
export default function AccountPage() {
    const [email, setEmail] = useState("kaorisme@gmaj.com");
    const [cur, setCur] = useState("");
    const [n1, setN1] = useState("");
    const [n2, setN2] = useState("");
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingPwd, setLoadingPwd] = useState(false);
    const { toast } = useToast();
    const onChangeEmail = async (e) => {
        e.preventDefault();
        setLoadingEmail(true);
        //fake API
        setTimeout(() => {
            setLoadingEmail(false);
            toast({
                title: "Cập nhật thành công",
                description: "Email đã được thay đổi.",
            });
        }, 1200);
    };
    const onChangePwd = async (e) => {
        e.preventDefault();
        if (n1 !== n2) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Mật khẩu nhập lại không khớp.",
            });
            return;
        }
        setLoadingPwd(true);
        //fake API 
        setTimeout(() => {
            setLoadingPwd(false);
            toast({
                title: "Đổi mật khẩu thành công",
                description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
            });
            setCur("");
            setN1("");
            setN2("");
        }, 1500);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsx("h2", { className: "text-xl font-semibold border-b pb-2 text-[#246f67]", children: "Thay \u0111\u1ED5i m\u1EADt kh\u1EA9u" }), _jsxs("section", { className: "space-y-3 bg-white rounded-lg shadow p-4 border", children: [_jsx("h3", { className: "font-semibold text-[#246f67]", children: "\u0110\u1ED5i m\u1EADt kh\u1EA9u" }), _jsxs("form", { onSubmit: onChangePwd, className: "space-y-3", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "M\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i" }), _jsx(Input, { type: "password", value: cur, onChange: (e) => setCur(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx(Input, { type: "password", value: n1, onChange: (e) => setN1(e.target.value), placeholder: "\u00CDt nh\u1EA5t 8 k\u00FD t\u1EF1", required: true })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx(Input, { type: "password", value: n2, onChange: (e) => setN2(e.target.value), placeholder: "Nh\u1EADp l\u1EA1i \u0111\u1EC3 x\u00E1c nh\u1EADn", required: true })] })] }), _jsx("span", { className: "text-xs text-gray-500", children: "G\u1EE3i \u00FD: d\u00F9ng ch\u1EEF hoa, s\u1ED1 v\u00E0 k\u00FD t\u1EF1 \u0111\u1EB7c bi\u1EC7t." }), _jsx("div", { className: "flex items-center gap-3 pt-1", children: _jsx(Button, { type: "submit", disabled: loadingPwd, className: "bg-gradient-to-r from-[#246f67] to-[#2ba195] !text-sm text-white hover:from-[#1e5c55] hover:to-[#238678]", children: loadingPwd ? "Đang đổi..." : "Đổi mật khẩu" }) })] })] })] }));
}
