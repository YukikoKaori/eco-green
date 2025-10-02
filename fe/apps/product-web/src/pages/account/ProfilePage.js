import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "Kaori Hzemou",
        phone: "",
        address: "",
        email: "kaorisme@gmaj.com",
        idNumber: "",
        invoiceInfo: "",
        gender: "",
        birthday: "",
        avatarDataUrl: "",
    });
    // ===== Avatar =====
    const fileRef = useRef(null);
    const onPickAvatar = () => fileRef.current?.click();
    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!/^image\//.test(file.type))
            return alert("Chỉ hỗ trợ file ảnh.");
        if (file.size > 2 * 1024 * 1024)
            return alert("Ảnh tối đa 2MB.");
        const reader = new FileReader();
        reader.onload = () => setProfile((p) => ({ ...p, avatarDataUrl: String(reader.result || "") }));
        reader.readAsDataURL(file);
    };
    // ===== Validate phone / idNumber =====
    const [errors, setErrors] = useState({});
    const phoneRe = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
    const idRe = /^(?:\d{9}|\d{12}|[A-Z0-9]{8,9})$/i;
    const validatePhone = (v) => !v ? undefined : phoneRe.test(v) ? undefined : "Số điện thoại không hợp lệ (VD: 0981234567 hoặc +84981234567)";
    const validateId = (v) => !v ? undefined : idRe.test(v) ? undefined : "CCCD/CMND 9 hoặc 12 số, hoặc hộ chiếu 8-9 ký tự (A-Z,0-9)";
    const onSubmit = (e) => {
        e.preventDefault();
        const next = { phone: validatePhone(profile.phone), idNumber: validateId(profile.idNumber) };
        setErrors(next);
        if (next.phone || next.idNumber)
            return;
        alert("Đã lưu thay đổi (demo).");
    };
    const [cur, setCur] = useState("");
    const [n1, setN1] = useState("");
    const [n2, setN2] = useState("");
    const [show, setShow] = useState({
        cur: false, n1: false, n2: false,
    });
    const [pwdLoading, setPwdLoading] = useState(false);
    const onChangePwd = async (e) => {
        e.preventDefault();
        if (n1.length < 8)
            return alert("Mật khẩu mới tối thiểu 8 ký tự.");
        if (n1 !== n2)
            return alert("Mật khẩu xác nhận không khớp.");
        setPwdLoading(true);
        setTimeout(() => {
            setPwdLoading(false);
            setCur("");
            setN1("");
            setN2("");
            alert("Đổi mật khẩu thành công (demo).");
        }, 600);
    };
    return (_jsxs("form", { onSubmit: onSubmit, className: "space-y-6 md:max-w-3xl", children: [_jsx("h2", { className: "text-xl font-semibold border-b pb-2 text-[#246f67]", children: "H\u1ED3 s\u01A1 c\u00E1 nh\u00E2n" }), _jsx("section", { className: "bg-white rounded-lg border shadow p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Avatar, { className: "h-20 w-20 ring-2 ring-[#2ba195]/30", children: profile.avatarDataUrl ? (_jsx(AvatarImage, { src: profile.avatarDataUrl, alt: "avatar" })) : (_jsx(AvatarFallback, { children: "Avatar" })) }), _jsxs("div", { className: "space-x-2", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onPickAvatar, className: "shadow-sm", children: "T\u1EA3i \u1EA3nh" }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", onChange: onFileChange, className: "hidden" }), profile.avatarDataUrl && (_jsx(Button, { type: "button", variant: "ghost", onClick: () => setProfile((p) => ({ ...p, avatarDataUrl: "" })), children: "X\u00F3a \u1EA3nh" }))] })] }) }), _jsxs("section", { className: "bg-white rounded-lg border shadow p-4 space-y-4", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "H\u1ECD v\u00E0 t\u00EAn" }), _jsx(Input, { value: profile.name, onChange: (e) => setProfile((p) => ({ ...p, name: e.target.value })), placeholder: "Nh\u1EADp h\u1ECD t\u00EAn", required: true })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "\u0110i\u1EC7n tho\u1EA1i" }), _jsx(Input, { value: profile.phone, onChange: (e) => {
                                            const v = e.target.value.trim();
                                            setProfile((p) => ({ ...p, phone: v }));
                                            setErrors((er) => ({ ...er, phone: validatePhone(v) }));
                                        }, onBlur: (e) => setErrors((er) => ({ ...er, phone: validatePhone(e.target.value.trim()) })), placeholder: "VD: 0981234567", "aria-invalid": !!errors.phone, className: errors.phone ? "ring-2 ring-red-400 focus-visible:ring-red-400" : "" }), errors.phone && _jsx("p", { className: "text-xs text-red-500", children: errors.phone })] })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "\u0110\u1ECBa ch\u1EC9" }), _jsx(Input, { value: profile.address, onChange: (e) => setProfile((p) => ({ ...p, address: e.target.value })), placeholder: "S\u1ED1 nh\u00E0, \u0111\u01B0\u1EDDng, ph\u01B0\u1EDDng/x\u00E3, qu\u1EADn/huy\u1EC7n, t\u1EC9nh/th\u00E0nh" })] })] }), _jsxs("section", { className: "bg-white rounded-lg border shadow p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "font-medium", children: "Email" }), _jsx(Button, { variant: "link", type: "button", className: "px-0 text-[#246f67] hover:underline", children: "Thay \u0111\u1ED5i" })] }), _jsx(Input, { value: profile.email, readOnly: true }), _jsx("p", { className: "text-xs text-gray-500", children: "D\u00F9ng email n\u00E0y \u0111\u1EC3 nh\u1EADn th\u00F4ng b\u00E1o v\u00E0 \u0111\u0103ng nh\u1EADp." })] }), _jsx("section", { className: "bg-white rounded-lg border shadow p-4 space-y-4", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "CCCD/CMND/H\u1ED9 chi\u1EBFu" }), _jsx(Input, { value: profile.idNumber, onChange: (e) => {
                                        const v = e.target.value.trim();
                                        setProfile((p) => ({ ...p, idNumber: v }));
                                        setErrors((er) => ({ ...er, idNumber: validateId(v) }));
                                    }, onBlur: (e) => setErrors((er) => ({ ...er, idNumber: validateId(e.target.value.trim()) })), placeholder: "VD: 0790xxxxxxx / B1234567", "aria-invalid": !!errors.idNumber, className: errors.idNumber ? "ring-2 ring-red-400 focus-visible:ring-red-400" : "" }), errors.idNumber && _jsx("p", { className: "text-xs text-red-500", children: errors.idNumber })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "Th\u00F4ng tin xu\u1EA5t h\u00F3a \u0111\u01A1n" }), _jsx(Input, { value: profile.invoiceInfo, onChange: (e) => setProfile((p) => ({ ...p, invoiceInfo: e.target.value })), placeholder: "T\u00EAn c\u00F4ng ty, MST, \u0111\u1ECBa ch\u1EC9..." })] })] }) }), _jsx("section", { className: "bg-white rounded-lg border shadow p-4 space-y-4", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col space-y-2 text-sm", children: [_jsx(Label, { children: "Gi\u1EDBi t\u00EDnh" }), _jsxs(Select, { value: profile.gender, onValueChange: (val) => setProfile((p) => ({ ...p, gender: val })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Ch\u1ECDn gi\u1EDBi t\u00EDnh" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "male", children: "Nam" }), _jsx(SelectItem, { value: "female", children: "N\u1EEF" }), _jsx(SelectItem, { value: "other", children: "Kh\u00E1c" })] })] })] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Label, { children: "Ng\u00E0y sinh" }), _jsx(Input, { type: "date", value: profile.birthday, onChange: (e) => setProfile((p) => ({ ...p, birthday: e.target.value })) })] })] }) }), _jsx("div", { className: "pt-1", children: _jsx(Button, { type: "submit", className: "px-6 bg-gradient-to-r from-[#246f67] to-[#2ba195] text-white hover:from-[#1e5c55] hover:to-[#238678]", children: "L\u01B0u thay \u0111\u1ED5i" }) })] }));
}
