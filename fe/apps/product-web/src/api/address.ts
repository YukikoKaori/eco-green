export type Province = { code: string; name: string };
export type District = { code: string; name: string; provinceCode: string };
export type Ward     = { code: string; name: string; districtCode: string };

export async function fetchProvinces(): Promise<Province[]> {
  const r = await fetch("https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1");
  const j = await r.json();
  return (j?.data?.data ?? []).map((p: any) => ({ code: String(p.code), name: p.name }));
}

export async function fetchDistricts(provinceCode: string): Promise<District[]> {
  const r = await fetch(`https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`);
  const j = await r.json();
  return (j?.data?.data ?? []).map((d: any) => ({
    code: String(d.code),
    name: d.name,
    provinceCode: String(d.province_code),
  }));
}

export async function fetchWards(districtCode: string): Promise<Ward[]> {
  const r = await fetch(`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtCode}&limit=-1`);
  const j = await r.json();
  return (j?.data?.data ?? []).map((w: any) => ({
    code: String(w.code),
    name: w.name,
    districtCode: String(w.district_code),
  }));
}
