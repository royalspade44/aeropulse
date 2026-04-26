import { LUZON_ADDRESS_DATA } from './luzonAddressData';

export const getRegions = () => LUZON_ADDRESS_DATA.map((entry) => entry.region);

export const getProvincesByRegion = (region) => {
  const selectedRegion = LUZON_ADDRESS_DATA.find((entry) => entry.region === region);
  if (!selectedRegion) return [];
  return selectedRegion.provinces.map((entry) => entry.province);
};

export const getCitiesByProvince = (region, province) => {
  const selectedRegion = LUZON_ADDRESS_DATA.find((entry) => entry.region === region);
  if (!selectedRegion) return [];
  const selectedProvince = selectedRegion.provinces.find((entry) => entry.province === province);
  if (!selectedProvince) return [];
  return selectedProvince.cities.map((entry) => entry.city);
};

export const getBarangaysByCity = (region, province, city) => {
  const selectedRegion = LUZON_ADDRESS_DATA.find((entry) => entry.region === region);
  if (!selectedRegion) return [];
  const selectedProvince = selectedRegion.provinces.find((entry) => entry.province === province);
  if (!selectedProvince) return [];
  const selectedCity = selectedProvince.cities.find((entry) => entry.city === city);
  if (!selectedCity) return [];
  return selectedCity.barangays;
};
