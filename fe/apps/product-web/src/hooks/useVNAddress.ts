import { useEffect, useState } from "react";
import { fetchProvinces, fetchDistricts, fetchWards, Province, District, Ward } from "@/api/address";

export function useVNAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");

  useEffect(() => {
    setLoadingProv(true);
    fetchProvinces().then(setProvinces).finally(() => setLoadingProv(false));
  }, []);

  useEffect(() => {
    if (!provinceCode) { setDistricts([]); setDistrictCode(""); setWards([]); setWardCode(""); return; }
    setLoadingDist(true);
    fetchDistricts(provinceCode)
      .then(setDistricts)
      .finally(() => setLoadingDist(false));
    setDistrictCode(""); setWards([]); setWardCode("");
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) { setWards([]); setWardCode(""); return; }
    setLoadingWard(true);
    fetchWards(districtCode)
      .then(setWards)
      .finally(() => setLoadingWard(false));
    setWardCode("");
  }, [districtCode]);

  const provinceName = provinces.find(p => p.code === provinceCode)?.name ?? null;
  const districtName = districts.find(d => d.code === districtCode)?.name ?? null;
  const wardName     = wards.find(w => w.code === wardCode)?.name ?? null;

  return {
    provinces, districts, wards,
    loadingProv, loadingDist, loadingWard,
    provinceCode, setProvinceCode,
    districtCode, setDistrictCode,
    wardCode, setWardCode,
    provinceName, districtName, wardName,
  };
}
